import { AmbientLight, DirectionalLight, OrthographicCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer } from "three";
import { ChibiCat, PALETTES, restPose, type CatColor, type CatPalette, type EyeMode, type PoseState } from "./ChibiCat";

/**
 * Web Kediler: sayfanın altında yaşayan, kodla çizilen anime tarzı kediler.
 *
 * Kediler fare imlecini izler, imleç yerde kıpırdarsa siner ve üstüne atlar; tıklanınca mırlar (arada
 * sırtüstü yuvarlanır); kendi kendine oturur, yalanır, gerinir, esner, uyur, birbirinin başını yalar,
 * birbirini kovalar, yumak kovalar, pati sallar. Model dosyası yok: her şey kodla çizilir.
 *
 * Çizim: tek bir ekran dışı WebGL çizicisi her kedinin çevresini çizip o kedinin küçük 2B tuvaline
 * kopyalar (sayfa genişliğinde bir tuval yerine; her kediye ayrı WebGL bağlamı da pahalı olurdu).
 * Arayüz bir Shadow DOM içinde durur: sitenin stilleri karışmaz.
 */

export interface CatOptions {
  color?: CatColor;
  /** Kendi renkleri (`color` yerine). */
  palette?: CatPalette;
  name?: string;
  /** Kişilik: 0..1. Oyuncu kedi imleci daha çok kovalar; uykucu daha çok uyur. */
  playful?: number;
  sleepy?: number;
}

export interface KedilerOptions {
  /** Kediler (varsayılan: turuncu ve siyah). */
  cats?: (CatColor | CatOptions)[];
  /** Kedinin boyu (piksel, kulak ucu). Varsayılan ekrana göre 70-120. */
  size?: number;
  /** İmleci izlesinler mi (varsayılan evet). */
  followCursor?: boolean;
  /** Zeminin ekranın altından yüksekliği (piksel; altta sabit bir çubuk varsa). */
  floorOffset?: number;
  zIndex?: number;
  /** Kendi kendine işler (uyuma, kovalamaca, dolaşma). Kapalıyken yalnızca izler ve okşanır. */
  autonomy?: boolean;
}

export type CatMood =
  | "walk"
  | "sit"
  | "sleep"
  | "purr"
  | "crouch"
  | "air"
  | "spin"
  | "chase"
  | "groom"
  | "stretch"
  | "play"
  | "roll"
  | "wave"
  | "yawn"
  | "cuddle";

type Kind = "purr" | "pounce" | "spin" | "yarn" | "groom" | "stretch" | "nap" | "flee" | "chaseCat" | "watch" | "roll" | "wave" | "yawn" | "visit" | "allogroom" | "groomed" | "wander";
interface Activity {
  kind: Kind;
  t: number;
  dur: number;
  x?: number;
  x0?: number;
  el?: HTMLElement;
  other?: Kedi;
}

const STRIDE = 0.2;
const CSS = `
:host { all: initial; }
canvas { position: fixed; left: 0; top: 0; pointer-events: none; will-change: transform; }
.fx, .say { position: fixed; pointer-events: none; transform: translate(-50%, -100%); font: 600 13px/1 system-ui, sans-serif; color: #e2557a; animation: float 1.6s ease-out forwards; }
.fx { font-size: 16px; }
.say { padding: 3px 7px; border-radius: 10px; background: #fff; color: #2b2340; box-shadow: 0 2px 8px #0002; animation-duration: 1.5s; }
.yarn { position: fixed; left: 0; top: 0; pointer-events: none; font-size: 22px; line-height: 1; transition: opacity .4s; }
.yarn.caught { opacity: 0; }
@keyframes float { 0% { opacity: 0; translate: 0 6px; } 15% { opacity: 1; } 100% { opacity: 0; translate: 0 -34px; } }
@media (prefers-reduced-motion: reduce) { .fx, .say { animation-duration: .01s; animation-delay: 0s !important; } }
`;

const damp = (cur: number, target: number, lambda: number, dt: number) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

/** WebGL işlemcide mi çiziliyor (yazılımla çizim): kenar yumuşatma kapalı, piksel oranı 1. */
function softwareGL(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}

export class Kedi {
  x: number;
  y = 0;
  name: string;
  readonly model: ChibiCat;
  readonly canvas: HTMLCanvasElement;
  readonly playful: number;
  readonly sleepy: number;
  /** Ekranın bir yanını sever (diğer kediyle üst üste binmesin). */
  readonly side: number;

  private readonly ctx: CanvasRenderingContext2D;
  private yaw = 0;
  private yawGoal = 0;
  private speed = 0;
  private phase = 0;
  private readonly p: PoseState = restPose();
  private sitW = 0;
  private lieW = 0;
  private crouchW = 0;
  private airW = 0;
  private groomW = 0;
  private stretchW = 0;
  private rollW = 0;
  private waveW = 0;
  private t = 0;
  private stillFor = 0;
  activity: Activity | null = null;
  private jump: { x0: number; y0: number; x1: number; t: number; T: number; h: number } | null = null;
  private lastPounce = -99;
  private nextIdle = 4 + Math.random() * 6;
  private blinkT = 2;
  private blink = 0;
  private twitchT = 3;
  private fxT = 0;
  private flush = 0;
  private trash: { el: HTMLElement; at: number }[] = [];

  constructor(
    opts: CatOptions,
    index: number,
    private readonly world: Kediler,
  ) {
    const palette = opts.palette ?? PALETTES[opts.color ?? "orange"] ?? PALETTES.orange;
    this.model = new ChibiCat(palette);
    this.model.root.traverse((o) => o.layers.set(1));
    world.scene.add(this.model.root);
    this.name = opts.name ?? "";
    this.playful = clamp(opts.playful ?? (index % 2 ? 0.45 : 0.9), 0, 1);
    this.sleepy = clamp(opts.sleepy ?? (index % 2 ? 0.8 : 0.25), 0, 1);
    this.side = index % 2 ? -1 : 1;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    world.root.appendChild(this.canvas);
    const w = innerWidth;
    this.x = clamp(w * (0.62 + (index % 2 ? -0.1 : 0.12) + index * 0.05), 40, w - 40);
    this.blinkT = 1 + Math.random() * 3;
  }

  get h(): number {
    return this.world.size;
  }

  // ------------------------------------------------------------------ dışarıdan

  /** Okşandı: mırlar ("^^") ya da arada sırtüstü yuvarlanır; kalpler uçar. */
  pet(): void {
    if (this.jump) return;
    const roll = this.lieW < 0.5 && Math.random() < 0.15 + 0.25 * this.playful;
    this.activity = roll ? { kind: "roll", t: 0, dur: 2.6 } : { kind: "purr", t: 0, dur: 2.4 };
    this.flush = 1;
    this.fx("♥", 3);
    this.say(Math.random() < 0.5 ? "mrrr~" : "prrr♥");
  }

  /** Pati sallar. */
  wave(): void {
    if (!this.jump) this.activity = { kind: "wave", t: 0, dur: 1.6 };
  }

  visit(other: Kedi): void {
    this.activity = { kind: "visit", t: 0, dur: 6, other };
  }

  beGroomed(seconds: number, by: Kedi): void {
    this.activity = { kind: "groomed", t: 0, dur: seconds, other: by };
  }

  flee(x: number): void {
    this.activity = { kind: "flee", t: 0, dur: 2.2, x };
    this.say("mya!");
  }

  chase(other: Kedi): void {
    this.activity = { kind: "chaseCat", t: 0, dur: 4, other };
  }

  chaseYarn(el: HTMLElement, from: number, to: number): void {
    if (!this.jump) this.activity = { kind: "yarn", t: 0, dur: 6, el, x0: from, x: to };
  }

  lostYarn(): void {
    this.activity = { kind: "watch", t: 0, dur: 1.5 };
  }

  get idle(): boolean {
    return !this.jump && !this.activity && this.stillFor > 1.5 && this.lieW < 0.3;
  }

  hitTest(px: number, py: number, slop = 0): boolean {
    const h = this.h;
    const w = h * (0.55 + 0.4 * Math.abs(Math.sin(this.yaw)));
    return Math.abs(px - this.x) < w / 2 + slop && py < this.y + 4 + slop && py > this.y - h * (1 - 0.35 * this.lieW) - slop;
  }

  mood(): CatMood {
    const a = this.activity;
    if (this.jump) return "air";
    switch (a?.kind) {
      case "purr":
      case "spin":
      case "groom":
      case "stretch":
      case "roll":
      case "wave":
      case "yawn":
        return a.kind;
      case "yarn":
        return "chase";
      case "pounce":
        return "crouch";
      case "flee":
      case "chaseCat":
        return "play";
      case "visit":
      case "allogroom":
      case "groomed":
        return "cuddle";
    }
    if (this.lieW > 0.5) return "sleep";
    if (this.sitW > 0.5) return "sit";
    return "walk";
  }

  // ------------------------------------------------------------------ kare

  update(dt: number): void {
    this.t += dt;
    if (this.trash.length) this.trash = this.trash.filter((x) => (this.t < x.at ? true : (x.el.remove(), false)));
    const floor = this.world.floor();
    if (this.jump) this.updateJump(dt, floor);
    else {
      this.y = floor;
      this.think(dt);
    }
    this.pose(dt);
  }

  private think(dt: number): void {
    const a = this.activity;
    const W = this.world;
    let targetX = this.x;
    let want: "stand" | "sit" | "lie" | "crouch" = "stand";
    let maxSpeed = 0.55;
    if (a) a.t += dt;
    const done = a && a.t >= a.dur;
    const left = 30;
    const right = innerWidth - 30;

    switch (a?.kind) {
      case "purr":
        want = this.lieW > 0.5 ? "lie" : "sit";
        this.faceToward(0, 0.25);
        break;
      case "groom":
      case "wave":
      case "yawn":
      case "watch":
        want = "sit";
        if (a.kind === "wave") this.faceToward(0, 0.2);
        break;
      case "stretch":
        break;
      case "nap":
        want = "lie";
        break;
      case "roll":
        this.yawGoal = 0.25 * this.side;
        break;
      case "spin":
        this.yaw += dt * 7.5;
        this.yawGoal = this.yaw;
        if (done) {
          this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
          this.yawGoal = 0.3 * this.side;
        }
        break;
      case "pounce":
        want = "crouch";
        this.faceToward((a.x ?? this.x) - this.x, Math.PI / 2);
        if (done) {
          this.activity = null;
          this.lastPounce = this.t;
          this.leap(clamp(a.x ?? this.x, left, right), 0.1);
          return;
        }
        break;
      case "yarn": {
        const k = Math.min(1, a.t / 1.6);
        const from = a.x0 ?? this.x;
        const to = a.x ?? this.x;
        const yx = from + (to - from) * (1 - (1 - k) ** 2);
        W.placeYarn(a.el!, yx, this.y, a.t * 540);
        targetX = yx - Math.sign(to - from) * this.h * 0.45;
        maxSpeed = 1.5 + 0.2 * this.playful;
        if (k >= 1 && Math.abs(this.x - targetX) < 8 && a.el!.isConnected && !a.el!.classList.contains("caught")) {
          const el = a.el!;
          this.activity = null;
          this.leap(yx, 0.08);
          this.fx("✨", 2);
          el.classList.add("caught");
          this.trash.push({ el, at: this.t + 0.45 });
          W.yarnCaught(this);
          return;
        }
        if (a.el!.classList.contains("caught")) this.activity = null;
        break;
      }
      case "flee":
        targetX = a.x ?? this.x;
        maxSpeed = 1.3;
        break;
      case "chaseCat": {
        const o = a.other!;
        targetX = o.x - Math.sign(o.x - this.x) * this.h * 0.55;
        maxSpeed = 1.35;
        if (Math.abs(o.x - this.x) < this.h * 0.7 && a.t > 0.8) {
          this.activity = { kind: "spin", t: 0, dur: 1.2 };
          o.activity = { kind: "spin", t: 0, dur: 1.2 };
          this.flush = o.flush = 1;
          this.say("mya!");
          return;
        }
        break;
      }
      case "visit": {
        const o = a.other!;
        if (o.jump) {
          this.activity = null;
          break;
        }
        targetX = o.x + Math.sign(this.x - o.x || 1) * this.h * 0.62;
        maxSpeed = 0.5;
        if (Math.abs(targetX - this.x) < 5) {
          this.activity = { kind: "allogroom", t: 0, dur: 3.2, other: o };
          o.beGroomed(3.4, this);
        }
        break;
      }
      case "allogroom":
        want = "sit";
        this.faceToward(a.other!.x - this.x, 0.9);
        break;
      case "groomed":
        want = this.sleepy > 0.6 ? "lie" : "sit";
        this.faceToward(a.other!.x - this.x, 0.35);
        break;
      case "wander":
        targetX = a.x ?? this.x;
        maxSpeed = 0.35;
        if (Math.abs(targetX - this.x) < 4) this.activity = null;
        break;
      default: {
        // İmleci izle: imleç sayfanın alt yarısında yeni kıpırdadıysa onun yanına (her kedi bir yanında).
        const p = W.pointer;
        if (W.followCursor && p && W.t - p.at < 3 && p.y > innerHeight * 0.45) {
          targetX = clamp(p.x + this.side * this.h * (0.55 + 0.25 * W.indexOf(this)), left, right);
          maxSpeed = 0.5 + Math.min(1, Math.abs(targetX - this.x) / (this.h * 4));
          if (Math.abs(targetX - this.x) < this.h * 0.3) targetX = this.x;
        }
        if (this.stillFor > 1.2) want = "sit";
        if (this.stillFor > 2 && W.autonomy) this.idleThought(dt);
        this.maybePounce();
      }
    }
    if (done && this.activity === a) {
      this.activity = a.kind === "nap" ? { kind: "stretch", t: 0, dur: 1.4 } : null;
      if (a.kind === "flee") this.say("mya~");
    }
    // Uyurken uyanır: imleç yanına gelirse.
    if (this.activity?.kind === "nap") {
      const p = W.pointer;
      if (p && W.t - p.at < 0.3 && Math.abs(p.x - this.x) < this.h * 0.6 && p.y > this.y - this.h * 1.2) this.activity = { kind: "stretch", t: 0, dur: 1.4 };
    }
    if (want === "lie" && this.activity?.kind === "nap") {
      this.fxT -= dt;
      if (this.fxT <= 0) {
        this.fxT = 2.4;
        this.fx("z", 1);
      }
    }

    const dist = targetX - this.x;
    const goalSpeed = Math.abs(dist) < 1.5 ? 0 : Math.min(maxSpeed, (Math.abs(dist) / W.ppm) * 2.2 + 0.08);
    this.speed = damp(this.speed, goalSpeed, 6, dt);
    if (want !== "stand" && this.speed > 0.05) want = "stand";
    const step = Math.min(Math.abs(dist), this.speed * W.ppm * dt);
    this.x += Math.sign(dist) * step;
    this.phase += ((this.speed * dt) / STRIDE) * Math.PI * 2;
    if (this.speed > 0.04) {
      this.stillFor = 0;
      this.faceToward(dist, Math.PI / 2);
    } else {
      this.stillFor += dt;
      if (!this.activity) this.faceToward(innerWidth / 2 - this.x, 0.45);
    }
    const k = this.activity?.kind;
    const prog = this.activity ? Math.min(1, this.activity.t / this.activity.dur) : 0;
    const bell = smooth(Math.min(1, Math.sin(prog * Math.PI) * 1.6));
    this.rollW = damp(this.rollW, k === "roll" ? bell : 0, 7, dt);
    this.waveW = damp(this.waveW, k === "wave" ? bell : 0, 9, dt);
    this.sitW = damp(this.sitW, want === "sit" ? 1 : 0, want === "sit" ? 3.5 : 7, dt);
    this.lieW = damp(this.lieW, want === "lie" ? 1 : 0, 2.5, dt);
    this.crouchW = damp(this.crouchW, want === "crouch" ? 1 : 0, 9, dt);
    this.groomW = damp(this.groomW, k === "groom" ? 1 : 0, 5, dt);
    this.stretchW = damp(this.stretchW, k === "stretch" ? smooth(Math.sin(prog * Math.PI)) : 0, 8, dt);
  }

  /** Boşta, kişiliğine göre: yalanır, gerinir, esner, uyur, dolaşır, öbür kediyle oynar ya da koklaşır. */
  private idleThought(dt: number): void {
    this.nextIdle -= dt;
    if (this.nextIdle > 0) return;
    this.nextIdle = 7 + Math.random() * 12;
    const r = Math.random();
    const W = this.world;
    if (r < this.sleepy * 0.35) this.activity = { kind: "nap", t: 0, dur: 14 + Math.random() * 16 };
    else if (r < 0.42) this.activity = { kind: "groom", t: 0, dur: 2.6 };
    else if (r < 0.52) this.activity = { kind: "stretch", t: 0, dur: 1.4 };
    else if (r < 0.6) this.activity = { kind: "yawn", t: 0, dur: 1.5 };
    else if (r < 0.72) this.activity = { kind: "wander", t: 0, dur: 12, x: clamp(this.x + (Math.random() - 0.5) * innerWidth * 0.6, 40, innerWidth - 40) };
    else if (r < 0.82) W.startCuddle(this);
    else if (r < 0.82 + this.playful * 0.18 && !W.reducedMotion) W.startTag(this);
  }

  /** İmleç yerde, yakında kıpırdıyorsa: siner ve üstüne atlar. */
  private maybePounce(): void {
    const W = this.world;
    const p = W.pointer;
    if (!p || W.t - p.at > 0.5 || this.t - this.lastPounce < 12 - 6 * this.playful || this.stillFor < 0.8) return;
    const h = this.h;
    const dx = p.x - this.x;
    if (Math.abs(dx) < h * 0.5 || Math.abs(dx) > h * 2.6 || p.y < this.y - h * 1.1 || p.y > this.y + 6) return;
    this.activity = { kind: "pounce", t: 0, dur: 0.9, x: p.x };
  }

  private faceToward(dx: number, amount: number): void {
    if (Math.abs(dx) > 1) this.yawGoal = Math.sign(dx) * amount;
  }

  private leap(x1: number, h: number): void {
    const dist = Math.abs(x1 - this.x) / this.world.ppm;
    this.jump = { x0: this.x, y0: this.y, x1, t: -0.2, T: clamp(0.35 + dist * 0.35, 0.35, 0.8), h };
    this.faceToward(x1 - this.x, Math.PI / 2);
    this.stillFor = 0;
    this.activity = null;
  }

  private updateJump(dt: number, floor: number): void {
    const j = this.jump!;
    j.t += dt;
    if (j.t < 0) {
      this.crouchW = damp(this.crouchW, 1, 14, dt);
      this.sitW = damp(this.sitW, 0, 12, dt);
      this.lieW = damp(this.lieW, 0, 12, dt);
      return;
    }
    const k = Math.min(1, j.t / j.T);
    const arc = j.h * this.world.ppm * 4 * k * (1 - k);
    this.x = j.x0 + (j.x1 - j.x0) * k;
    this.y = floor - arc;
    this.p.rise = clamp(1 - 2 * k, -1, 1);
    this.airW = damp(this.airW, k < 0.88 ? 1 : 0, 16, dt);
    this.crouchW = damp(this.crouchW, 0, 14, dt);
    if (k >= 1) {
      this.jump = null;
      this.y = floor;
      this.crouchW = 0.6;
    }
  }

  // ------------------------------------------------------------------ poz

  private pose(dt: number): void {
    const p = this.p;
    const a = this.activity?.kind;
    const W = this.world;
    p.t = this.t;
    p.phase = this.phase;
    const moving = this.speed > 0.04;
    p.walk = damp(p.walk, moving ? 1 : 0, 9, dt);
    p.run = damp(p.run, this.speed > 0.9 ? 1 : 0, 4, dt);
    p.sit = this.sitW;
    p.lie = this.lieW;
    p.crouch = this.crouchW;
    p.air = this.airW;
    if (!this.jump) this.airW = damp(this.airW, 0, 16, dt);
    p.groom = this.groomW;
    p.stretch = this.stretchW;
    p.knead = damp(p.knead, a === "purr" && this.playful > 0.5 ? 1 : 0, 5, dt);
    p.roll = this.rollW;
    p.rollSide = Math.sign(this.yawGoal || 1);
    p.wave = this.waveW;
    p.breathe = Math.sin(this.t * (this.lieW > 0.5 ? 1.6 : 2.6)) * 0.5 + 0.5;
    const happy = a === "purr" || a === "chaseCat" || a === "flee" || a === "groomed";
    p.tailUp = damp(p.tailUp, happy ? 1 : moving ? 0.5 : 0, 4, dt);
    p.tailSwish = damp(p.tailSwish, a === "pounce" ? 0.55 : this.lieW > 0.5 ? 0.05 : 0.25, 4, dt);
    p.tailSpeed = a === "pounce" ? 9 : a === "purr" ? 3 : 1.6;
    p.ears = damp(p.ears, a === "pounce" ? -0.6 : 1, 6, dt);
    this.twitchT -= dt;
    if (this.twitchT <= 0) {
      this.twitchT = 2.5 + Math.random() * 5;
      p.earTwitch = 1;
    }
    p.earTwitch = Math.max(0, p.earTwitch - dt * 6);
    // Bakış: imleç yakında ve yeni kıpırdadıysa ona, değilse ileriye.
    const ptr = W.pointer;
    const near = ptr && W.t - ptr.at < 2 && Math.abs(ptr.x - this.x) < this.h * 4;
    let lyaw = 0;
    let lpitch = 0.1;
    let ex = 0;
    let ey = 0.2;
    if (near && ptr) {
      const dx = ptr.x - this.x;
      const dy = this.y - this.h * 0.6 - ptr.y;
      lyaw = clamp(Math.sign(dx) * 0.6 - Math.sin(this.yaw) * 0.6, -0.7, 0.7) * (Math.abs(dx) > 4 ? 1 : 0);
      lpitch = clamp(Math.atan2(dy, Math.abs(dx) + this.h) * 0.7, -0.25, 0.35);
      ex = clamp(dx / (this.h * 2), -1, 1) * Math.cos(this.yaw);
      ey = clamp(dy / (this.h * 3), -0.6, 1);
    }
    p.headYaw = damp(p.headYaw, lyaw * (1 - this.lieW) * (1 - this.groomW), 5, dt);
    p.headPitch = damp(p.headPitch, lpitch * (1 - this.lieW) * (1 - this.groomW), 5, dt);
    const lick = a === "allogroom" ? Math.sin(this.t * 9) * 0.08 : 0;
    p.headTilt = damp(p.headTilt, a === "purr" || a === "groomed" ? 0.22 : a === "watch" ? 0.15 : a === "allogroom" ? -0.3 : 0, 4, dt);
    if (a === "allogroom") p.headPitch = damp(p.headPitch, -0.25 + lick, 8, dt);
    if (a === "yawn") p.headPitch = damp(p.headPitch, 0.35, 6, dt);
    p.lookX = damp(p.lookX, ex, 8, dt);
    p.lookY = damp(p.lookY, ey, 8, dt);
    let eyes: EyeMode = "open";
    if (a === "purr" || a === "roll" || a === "groomed") eyes = "happy";
    else if (this.lieW > 0.5 || this.groomW > 0.5 || this.stretchW > 0.4 || a === "yawn" || a === "allogroom") eyes = "closed";
    else if (a === "pounce") eyes = "surprised";
    p.eyes = eyes;
    this.blinkT -= dt;
    if (this.blinkT <= 0) {
      this.blink = 1;
      this.blinkT = 2.5 + Math.random() * 3.5;
    }
    this.blink = Math.max(0, this.blink - dt * 7);
    p.eyeOpen = 1 - Math.sin(this.blink * Math.PI) * 0.95;
    const yawnO = a === "yawn" ? Math.sin(Math.min(1, this.activity!.t / this.activity!.dur) * Math.PI) : 0;
    p.mouthOpen = damp(p.mouthOpen, Math.max(this.stretchW > 0.3 ? 1 : 0, yawnO, a === "allogroom" ? 0.35 + lick * 3 : 0), 10, dt);
    this.flush = Math.max(0, this.flush - dt * 0.25);
    p.blush = Math.max(0.35, this.flush);
    this.model.apply(p);

    this.yaw = damp(this.yaw, this.yawGoal, 7, dt);
    const root = this.model.root;
    root.rotation.y = this.yaw;
    root.scale.setScalar(1);
    W.toWorld(this.x, this.y, root.position);
  }

  /** Kedinin çevresini ortak çizicide çizer ve kendi tuvaline kopyalar. */
  render(renderer: WebGLRenderer, camera: OrthographicCamera, box: number): void {
    const x = Math.round(this.x - box / 2);
    const y = Math.round(this.y - box * 0.72);
    camera.setViewOffset(innerWidth, innerHeight, x, y, box, box);
    renderer.render(this.world.scene, camera);
    const src = renderer.domElement;
    if (this.canvas.width !== src.width || this.canvas.height !== src.height) {
      this.canvas.width = src.width;
      this.canvas.height = src.height;
      this.canvas.style.width = `${box}px`;
      this.canvas.style.height = `${box}px`;
    }
    this.ctx.clearRect(0, 0, src.width, src.height);
    this.ctx.drawImage(src, 0, 0);
    this.canvas.style.transform = `translate(${x}px, ${y}px)`;
  }

  fx(text: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "fx";
      el.textContent = text;
      el.style.left = `${this.x + (Math.random() - 0.5) * this.h * 0.5}px`;
      el.style.top = `${this.y - this.h * 0.95}px`;
      el.style.animationDelay = `${i * 0.18}s`;
      this.world.root.appendChild(el);
      setTimeout(() => el.remove(), 1800 + i * 180);
    }
  }

  say(text: string): void {
    const el = document.createElement("span");
    el.className = "say";
    el.textContent = text;
    el.style.left = `${this.x}px`;
    el.style.top = `${this.y - this.h * 1.1}px`;
    this.world.root.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
}

/** Kediler: sahne, ortak çizici, imleç, kediler arası işler (kovalamaca, koklaşma, yumak). */
export class Kediler {
  readonly scene = new Scene();
  readonly cats: Kedi[] = [];
  readonly root: ShadowRoot;
  readonly host: HTMLElement;
  pointer: { x: number; y: number; at: number } | null = null;
  t = 0;
  autonomy: boolean;
  followCursor: boolean;
  readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** Kedi boyu (piksel). */
  size = 100;
  /** Metre başına piksel (model ölçeğinde: kedinin boyu ~0,39 m). */
  ppm = 1;
  private readonly fixedSize: number | null;
  private readonly floorOffset: number;
  private readonly renderer: WebGLRenderer;
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  private box = 0;
  private tagCooldown = 25;
  private cuddleCooldown = 15;
  private last = performance.now();
  private raf = 0;
  private stopped = false;
  private readonly software = softwareGL();
  private readonly off: (() => void)[] = [];

  constructor(options: KedilerOptions = {}) {
    this.autonomy = options.autonomy ?? true;
    this.followCursor = options.followCursor ?? true;
    this.fixedSize = options.size ?? null;
    this.floorOffset = options.floorOffset ?? 0;
    this.host = document.createElement("web-kediler");
    this.host.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:${options.zIndex ?? 2147483000};`;
    this.root = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    this.root.appendChild(style);
    document.body.appendChild(this.host);

    const key = new DirectionalLight(0xffffff, Math.PI * 0.85);
    key.position.set(-1, 2, 3);
    const amb = new AmbientLight(0xffffff, Math.PI * 0.12);
    key.layers.enableAll();
    amb.layers.enableAll();
    this.scene.add(key, amb);
    this.renderer = new WebGLRenderer({ alpha: true, antialias: !this.software });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(this.software ? 1 : Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);
    this.camera.layers.set(1);

    const list = options.cats ?? ["orange", "black"];
    list.forEach((c, i) => this.cats.push(new Kedi(typeof c === "string" ? { color: c } : c, i, this)));
    this.resize();
    this.listen(window, "resize", () => this.resize());
    this.listen(window, "pointermove", (e) => {
      const ev = e as PointerEvent;
      if (ev.pointerType === "mouse") this.pointer = { x: ev.clientX, y: ev.clientY, at: this.t };
    });
    // Kediye tıklama: okşanır (alttaki öğeye tıklanmaz).
    this.listen(
      window,
      "pointerdown",
      (e) => {
        const ev = e as PointerEvent;
        const cat = this.cats.find((k) => k.hitTest(ev.clientX, ev.clientY, ev.pointerType === "touch" ? 12 : 0));
        if (!cat) return;
        ev.preventDefault();
        ev.stopPropagation();
        cat.pet();
      },
      { capture: true },
    );
    this.listen(document, "visibilitychange", () => (this.last = performance.now()));
    this.loop();
  }

  private listen(target: EventTarget, type: string, fn: (e: Event) => void, opts: AddEventListenerOptions = { passive: true }): void {
    target.addEventListener(type, fn, opts);
    this.off.push(() => target.removeEventListener(type, fn, opts));
  }

  private resize(): void {
    this.size = this.fixedSize ?? clamp(Math.min(innerHeight * 0.14, innerWidth * 0.2), 70, 120);
    this.ppm = this.size / ChibiCat.HEIGHT;
    const hw = innerWidth / 2 / this.ppm;
    const hh = innerHeight / 2 / this.ppm;
    Object.assign(this.camera, { left: -hw, right: hw, top: hh, bottom: -hh });
    this.camera.updateProjectionMatrix();
    this.box = Math.ceil(this.size * 2.2);
    this.renderer.setSize(this.box, this.box);
  }

  /** Zeminin ekran y'si (piksel). */
  floor(): number {
    return innerHeight - this.floorOffset;
  }

  toWorld(px: number, py: number, out: Vector3): Vector3 {
    return out.set((px - innerWidth / 2) / this.ppm, (innerHeight / 2 - py) / this.ppm, 0);
  }

  indexOf(cat: Kedi): number {
    return this.cats.indexOf(cat);
  }

  private loop = (): void => {
    if (this.stopped) return;
    this.raf = requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    // Hepsi dururken 30 FPS yeter (pil); yazılımla çizerken 20.
    const calm = this.cats.every((c) => c.mood() === "sit" || c.mood() === "sleep");
    if (dt < (this.software ? 1 / 20 : calm ? 1 / 30 : 0) - 0.004) return;
    this.last = now;
    this.step(dt);
  };

  /** Zamanı elle ilerletir (test için). */
  step(dt: number): void {
    this.t += dt;
    this.tagCooldown -= dt;
    this.cuddleCooldown -= dt;
    for (const c of this.cats) c.update(dt);
    for (const c of this.cats) c.render(this.renderer, this.camera, this.box);
  }

  /** İki kedi boştaysa: biri kaçar, öbürü kovalar. */
  startTag(cat: Kedi): void {
    if (this.tagCooldown > 0) return;
    const other = this.cats.find((o) => o !== cat && o.idle);
    if (!other) return;
    this.tagCooldown = 35 + Math.random() * 30;
    const span = cat.h * 3;
    const to = clamp(cat.x + (cat.x > innerWidth / 2 ? -span : span), 40, innerWidth - 40);
    cat.flee(to);
    other.chase(cat);
  }

  /** Bir kedi öbürünün yanına gidip başını yalar. */
  startCuddle(cat: Kedi): void {
    if (this.cuddleCooldown > 0) return;
    const other = this.cats.find((o) => o !== cat && o.idle);
    if (!other) return;
    this.cuddleCooldown = 40 + Math.random() * 30;
    cat.visit(other);
  }

  /** Yere bir yumak atar; kediler kovalar, önce varan yakalar. `x` verilmezse kedilerin ortasından. */
  yarn(x?: number): void {
    const from = x ?? this.cats.reduce((s, c) => s + c.x, 0) / Math.max(1, this.cats.length);
    const dir = from < innerWidth / 2 ? 1 : -1;
    const to = clamp(from + dir * innerWidth * 0.35, 40, innerWidth - 40);
    const el = document.createElement("span");
    el.className = "yarn";
    el.textContent = "🧶";
    this.root.appendChild(el);
    this.placeYarn(el, from, this.floor(), 0);
    for (const c of this.cats) c.chaseYarn(el, from, to);
  }

  placeYarn(el: HTMLElement, x: number, top: number, deg: number): void {
    el.style.transform = `translate(${x}px, ${top}px) translate(-50%, -100%) rotate(${deg}deg)`;
  }

  yarnCaught(winner: Kedi): void {
    for (const c of this.cats) if (c !== winner && c.mood() === "chase") c.lostYarn();
  }

  /** Bütün kediler pati sallar. */
  wave(): void {
    for (const c of this.cats) c.wave();
  }

  /** Kedileri kaldırır. */
  destroy(): void {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    for (const f of this.off) f();
    this.renderer.dispose();
    this.host.remove();
  }
}
