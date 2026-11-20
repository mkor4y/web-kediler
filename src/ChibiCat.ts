import {
  BackSide,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  DataTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  RedFormat,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";

/**
 * Kodla çizilen anime tarzı kedi: büyük baş, iri parlak gözler, ":3" ağız, yanak pembesi,
 * bıyıklar; çizgi film gölgesi ve koyu kontur (Aiko'nun tarzı). Model dosyası yok: her eklem bizim,
 * bütün hareketler (yürüme, koşma, oturma, somun gibi yatma, sinme, zıplama, yalanma, gerinme) ve
 * yüz ifadeleri (açık, mutlu "^^", kapalı, şaşkın) kodla verilir.
 *
 * Ölçüler metre, kedinin kendi ölçüsünde (kulak ucu ~0,39 m); önü +z, yukarısı +y.
 */

export interface CatPalette {
  coat: number;
  /** Tekir çizgileri; yoksa düz renk. */
  stripe: number | null;
  chest: number;
  paws: number;
  muzzle: number;
  earInner: number;
  nose: number;
  /** Gözün rengi ve göz bebeği. */
  iris: number;
  pupil: number;
  /** Kontur, ağız ve göz çizgileri. */
  ink: number;
  whisker: number;
  blush: number;
  /** Kuyruğun ucu. */
  tailTip: number;
}

export const ORANGE_TABBY: CatPalette = {
  coat: 0xf4a24f,
  stripe: 0xe0782c,
  chest: 0xfff3e2,
  paws: 0xfff3e2,
  muzzle: 0xfff3e2,
  earInner: 0xffa9bd,
  nose: 0xff7f9a,
  iris: 0x7a4128,
  pupil: 0x2a1a22,
  ink: 0x3a2418,
  whisker: 0x3a2418,
  blush: 0xff8fa8,
  tailTip: 0xfff3e2,
};

export const BLACK_CAT: CatPalette = {
  coat: 0x34303d,
  stripe: null,
  chest: 0x403a4b,
  paws: 0x34303d,
  muzzle: 0x46404f,
  earInner: 0xc7889c,
  nose: 0xe58aa0,
  iris: 0xd7d64a,
  pupil: 0x16121c,
  ink: 0x120f17,
  whisker: 0xeae6f2,
  blush: 0xff8fa8,
  tailTip: 0x34303d,
};

export const WHITE_CAT: CatPalette = {
  coat: 0xfbf8f4,
  stripe: null,
  chest: 0xffffff,
  paws: 0xffffff,
  muzzle: 0xffffff,
  earInner: 0xffb3c4,
  nose: 0xff8aa5,
  iris: 0x5aa8e0,
  pupil: 0x1f2a3a,
  ink: 0x5a4a52,
  whisker: 0x8a7a82,
  blush: 0xff9ab0,
  tailTip: 0xfbf8f4,
};

export const GRAY_TABBY: CatPalette = {
  coat: 0x9aa0ac,
  stripe: 0x6c7280,
  chest: 0xe8eaef,
  paws: 0xe8eaef,
  muzzle: 0xeef0f4,
  earInner: 0xf0a8b8,
  nose: 0xe8879c,
  iris: 0x6bb86a,
  pupil: 0x1d2420,
  ink: 0x2c2f38,
  whisker: 0x2c2f38,
  blush: 0xff9ab0,
  tailTip: 0x6c7280,
};

export const PALETTES = { orange: ORANGE_TABBY, black: BLACK_CAT, white: WHITE_CAT, gray: GRAY_TABBY } as const;
export type CatColor = keyof typeof PALETTES;

export type EyeMode = "open" | "happy" | "closed" | "surprised";

/** Bir karede uygulanacak poz: payları 0..1. */
export interface PoseState {
  /** Yürüyüş fazı (radyan) ve yürüme payı; `run` 1 iken sıçrayarak koşar. */
  phase: number;
  walk: number;
  run: number;
  sit: number;
  lie: number;
  crouch: number;
  air: number;
  /** Havada dikey hız işareti (-1 düşüyor, +1 yükseliyor). */
  rise: number;
  groom: number;
  stretch: number;
  /** Yoğurma: ön patiler sırayla basar ("hamur yapma"). */
  knead: number;
  /** Sırtüstü yuvarlanma (göbek gösterme); `rollSide` hangi yana. */
  roll: number;
  rollSide: number;
  /** Pati sallama (sağ ön pati havada). */
  wave: number;
  /** Yana yaslanma (Aiko'nun bacağına sürtünürken; işaret yön). */
  lean: number;
  /** Sinmişken kalça sallama ve genel zaman (sn). */
  t: number;
  headYaw: number;
  headPitch: number;
  headTilt: number;
  /** Kuyruk: sallanma genliği ve hızı; dik kalkma payı. */
  tailSwish: number;
  tailSpeed: number;
  tailUp: number;
  /** Kulaklar: 1 dik, -1 yatık; seğirme. */
  ears: number;
  earTwitch: number;
  eyes: EyeMode;
  /** Göz açıklığı (kırpma). */
  eyeOpen: number;
  /** Bakış: göz bebeklerinin kayması (-1..1). */
  lookX: number;
  lookY: number;
  blush: number;
  /** Ağız açık ("o"; esneme, şaşırma). */
  mouthOpen: number;
  /** Nefes (0..1 arası dalga). */
  breathe: number;
}

export const restPose = (): PoseState => ({
  phase: 0,
  walk: 0,
  run: 0,
  sit: 0,
  lie: 0,
  crouch: 0,
  air: 0,
  rise: 0,
  groom: 0,
  stretch: 0,
  knead: 0,
  roll: 0,
  rollSide: 1,
  wave: 0,
  lean: 0,
  t: 0,
  headYaw: 0,
  headPitch: 0,
  headTilt: 0,
  tailSwish: 0.25,
  tailSpeed: 1.6,
  tailUp: 0,
  ears: 1,
  earTwitch: 0,
  eyes: "open",
  eyeOpen: 1,
  lookX: 0,
  lookY: 0,
  blush: 0.5,
  mouthOpen: 0,
  breathe: 0,
});

function gradient(): DataTexture {
  const t = new DataTexture(new Uint8Array([95, 175, 255]), 3, 1, RedFormat);
  t.minFilter = t.magFilter = NearestFilter;
  t.needsUpdate = true;
  return t;
}
let GRAD: DataTexture | null = null;

/** Tekir çizgileri: kafanın ve gövdenin dokusu (beyaz zemin, rengi malzeme verir). */
function tabby(stripes: number, color: number, coat: number): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 512, 256);
  // Doku malzemenin rengiyle çarpılır: çizgi rengi = çizgi / kürk.
  const ch = (v: number, s: number) => Math.min(255, Math.round((((v >> s) & 255) / Math.max(1, (coat >> s) & 255)) * 255));
  g.fillStyle = `rgb(${ch(color, 16)},${ch(color, 8)},${ch(color, 0)})`;
  for (let i = 0; i < stripes; i++) {
    const x = 128 + (i - (stripes - 1) / 2) * 34;
    g.beginPath();
    g.ellipse(x, 40, 9, 46, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

interface Leg {
  hip: Object3D;
  knee: Object3D;
  front: boolean;
  side: number;
}

export class ChibiCat {
  readonly root = new Group();
  /** Arka kalçada döner (oturunca ön taraf kalkar); alçalma da burada. */
  private readonly pivot = new Object3D();
  private readonly torso: Mesh;
  private readonly head = new Object3D();
  private readonly headBase = new Vector3();
  private readonly legs: Leg[] = [];
  private readonly tail: Object3D[] = [];
  private readonly ears: Object3D[] = [];
  private readonly eyes: Object3D[] = [];
  private readonly pupils: Object3D[] = [];
  private readonly eyesHappy: Object3D[] = [];
  private readonly eyesClosed: Object3D[] = [];
  private readonly blushes: Mesh[] = [];
  private readonly mouth: Object3D[] = [];
  private readonly mouthO: Mesh;
  private readonly line: MeshBasicMaterial;

  constructor(readonly palette: CatPalette) {
    GRAD ??= gradient();
    const p = palette;
    this.line = new MeshBasicMaterial({ color: p.ink, side: BackSide });
    const toon = (color: number, map?: CanvasTexture) => new MeshToonMaterial({ color, gradientMap: GRAD, map: map ?? null });
    const R = 0.12;
    // Arka kalça ekseni: gövde bunun çevresinde döner.
    this.pivot.position.set(0, 0.09, -0.11);
    this.root.add(this.pivot);
    const rel = (x: number, y: number, z: number) => new Vector3(x, y - 0.09, z + 0.11);

    // Gövde: yumuşak fasulye; göğüs.
    this.torso = this.part(new SphereGeometry(1, 40, 28), toon(p.coat, p.stripe === null ? undefined : tabby(4, p.stripe, p.coat)));
    this.torso.scale.set(0.105, 0.095, 0.15);
    this.torso.position.copy(rel(0, 0.115, -0.02));
    this.pivot.add(this.torso);
    const chest = this.part(new SphereGeometry(1, 28, 20), toon(p.chest), 0);
    chest.scale.set(0.07, 0.075, 0.06);
    chest.position.copy(rel(0, 0.12, 0.09));
    this.pivot.add(chest);

    // Bacaklar: kalça ve diz eklemli; patiler.
    const upper = new CapsuleGeometry(0.027, 0.03, 6, 14);
    const lower = new CapsuleGeometry(0.024, 0.03, 6, 14);
    const pawGeo = new SphereGeometry(1, 20, 14);
    for (const [x, z, front] of [[0.058, 0.085, true], [-0.058, 0.085, true], [0.06, -0.11, false], [-0.06, -0.11, false]] as const) {
      const hip = new Object3D();
      hip.position.copy(rel(x, 0.1, z));
      const up = this.part(upper, toon(p.coat));
      up.position.y = -0.022;
      const knee = new Object3D();
      knee.position.y = -0.044;
      const lo = this.part(lower, toon(p.coat));
      lo.position.y = -0.02;
      const paw = this.part(pawGeo, toon(p.paws));
      paw.scale.set(0.031, 0.022, 0.036);
      paw.position.set(0, -0.046, 0.008);
      knee.add(lo, paw);
      hip.add(up, knee);
      this.pivot.add(hip);
      this.legs.push({ hip, knee, front, side: Math.sign(x) });
    }

    // Kuyruk: altı parça; her parça bir sonrakinin ebeveyni.
    let parent: Object3D = this.pivot;
    const seg = 0.043;
    for (let i = 0; i < 6; i++) {
      const j = new Object3D();
      if (i === 0) j.position.copy(rel(0, 0.15, -0.155));
      else j.position.set(0, seg, 0);
      const r = 0.026 - i * 0.0017;
      const color = i >= 5 ? p.tailTip : p.stripe !== null && i % 2 ? p.stripe : p.coat;
      const piece = this.part(new CapsuleGeometry(r, seg * 0.7, 6, 14), toon(color));
      piece.position.y = seg / 2;
      j.add(piece);
      parent.add(j);
      this.tail.push(j);
      parent = j;
    }

    // Baş.
    this.headBase.copy(rel(0, 0.255, 0.075));
    this.head.position.copy(this.headBase);
    this.pivot.add(this.head);
    const skull = this.part(new SphereGeometry(1, 48, 32), toon(p.coat, p.stripe === null ? undefined : tabby(3, p.stripe, p.coat)));
    skull.scale.set(R * 1.12, R * 0.95, R);
    this.head.add(skull);
    for (const s of [-1, 1]) {
      const cheek = this.part(new SphereGeometry(1, 24, 16), toon(p.coat), 0.005);
      cheek.scale.set(0.05, 0.04, 0.05);
      cheek.position.set(s * 0.085, -0.045, 0.03);
      this.head.add(cheek);
    }
    const muzzle = this.part(new SphereGeometry(1, 28, 20), toon(p.muzzle), 0);
    muzzle.scale.set(0.055, 0.036, 0.03);
    muzzle.position.set(0, -0.045, R * 0.9);
    this.head.add(muzzle);

    // Kulaklar.
    for (const s of [-1, 1]) {
      const ear = new Object3D();
      ear.position.set(s * 0.068, 0.085, -0.005);
      ear.userData.side = s;
      const outer = this.part(new ConeGeometry(0.048, 0.085, 4, 1), toon(p.coat));
      outer.rotation.y = Math.PI / 4;
      outer.position.y = 0.035;
      const inner = this.part(new ConeGeometry(0.03, 0.06, 4, 1), toon(p.earInner), 0);
      inner.rotation.y = Math.PI / 4;
      inner.position.set(0, 0.03, 0.016);
      ear.add(outer, inner);
      this.head.add(ear);
      this.ears.push(ear);
    }

    // Gözler: iri iris, göz bebeği, iki parıltı; mutlu (^^) ve kapalı (‿) hâller ayrı çizgiler.
    const inkM = new MeshBasicMaterial({ color: p.pupil });
    const irisM = new MeshBasicMaterial({ color: p.iris });
    const white = new MeshBasicMaterial({ color: 0xffffff });
    const lineM = new MeshBasicMaterial({ color: p.ink === p.pupil ? p.ink : p.pupil });
    const ball = new SphereGeometry(1, 24, 16);
    const facing = (at: Vector3) => {
      const o = new Object3D();
      o.position.copy(at);
      o.lookAt(at.clone().multiplyScalar(2));
      this.head.add(o);
      return o;
    };
    for (const s of [-1, 1]) {
      const at = new Vector3(s * 0.05, 0.0, R * 0.93);
      const eye = facing(at);
      const rim = new Mesh(ball, inkM);
      rim.scale.set(0.026, 0.034, 0.008);
      const look = new Object3D();
      const ir = new Mesh(ball, irisM);
      ir.scale.set(0.019, 0.025, 0.006);
      ir.position.set(0, -0.004, 0.004);
      const pu = new Mesh(ball, inkM);
      pu.scale.set(0.01, 0.017, 0.004);
      pu.position.set(0, -0.004, 0.007);
      const g1 = new Mesh(ball, white);
      g1.scale.set(0.009, 0.011, 0.004);
      g1.position.set(-s * 0.008, 0.012, 0.009);
      const g2 = new Mesh(ball, white);
      g2.scale.setScalar(0.0045);
      g2.position.set(s * 0.009, -0.013, 0.009);
      look.add(ir, pu, g1, g2);
      eye.add(rim, look);
      this.eyes.push(eye);
      this.pupils.push(look);
      const arc = (up: boolean) => {
        const pts = [-1, -0.5, 0, 0.5, 1].map((u) => new Vector3(u * 0.022, (up ? 1 : -1) * (0.012 - 0.012 * u * u), 0));
        const o = facing(at);
        o.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 16, 0.0042, 6), lineM));
        o.visible = false;
        return o;
      };
      this.eyesHappy.push(arc(true));
      this.eyesClosed.push(arc(false));
      const blush = new Mesh(ball, new MeshBasicMaterial({ color: p.blush, transparent: true, opacity: 0.5, depthWrite: false }));
      blush.scale.set(0.022, 0.011, 0.004);
      const bAt = new Vector3(s * 0.072, -0.026, R * 0.88);
      blush.position.copy(bAt);
      blush.lookAt(bAt.clone().multiplyScalar(2));
      this.head.add(blush);
      this.blushes.push(blush);
    }

    // Burun, ":3" ağız, "o" ağız, bıyıklar.
    const front = R * 0.9 + 0.03;
    const nose = new Mesh(new SphereGeometry(1, 16, 10), toon(p.nose));
    nose.scale.set(0.012, 0.008, 0.008);
    nose.position.set(0, -0.034, front + 0.004);
    this.head.add(nose);
    const mouthPts = (s: number) => [0, 0.5, 1].map((u) => new Vector3(s * u * 0.016, -0.004 - Math.sin(u * Math.PI) * 0.007, 0));
    for (const s of [-1, 1]) {
      const m = new Mesh(new TubeGeometry(new CatmullRomCurve3(mouthPts(s)), 12, 0.0026, 6), lineM);
      m.position.set(0, -0.05, front + 0.002);
      this.head.add(m);
      this.mouth.push(m);
    }
    this.mouthO = new Mesh(ball, new MeshBasicMaterial({ color: 0x7a2c3a }));
    this.mouthO.scale.set(0.011, 0.013, 0.004);
    this.mouthO.position.set(0, -0.062, front);
    this.mouthO.visible = false;
    this.head.add(this.mouthO);
    const whiskerM = new MeshBasicMaterial({ color: p.whisker });
    for (const s of [-1, 1]) {
      for (const k of [-1, 0, 1]) {
        const pts = [new Vector3(s * 0.06, -0.035 + k * 0.008, R * 0.85), new Vector3(s * 0.15, -0.03 + k * 0.022, R * 0.55)];
        this.head.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 2, 0.0012, 4), whiskerM));
      }
    }
  }

  /** Kontürlü parça: biraz büyütülmüş, arka yüzü çizilen koyu kopya (dışbükey şekiller için). */
  private part(geo: BufferGeometry, mat: Material, outline = 0.006): Mesh {
    const m = new Mesh(geo, mat);
    if (outline > 0) {
      geo.computeBoundingSphere();
      const o = new Mesh(geo, this.line);
      o.scale.setScalar(1 + outline / geo.boundingSphere!.radius);
      m.add(o);
    }
    return m;
  }

  /** Pozu uygular (her kare; mutlak açılar, birikmez). */
  apply(s: PoseState): void {
    const sit = s.sit * (1 - s.lie);
    const lie = s.lie;
    const cr = s.crouch * (1 - lie);
    const air = s.air;
    const groom = s.groom * sit;
    const stretch = s.stretch * (1 - sit) * (1 - lie);
    const roll = s.roll * (1 - air);
    const knead = s.knead * (1 - roll);
    const wave = s.wave * (1 - roll) * (1 - lie);
    const walk = s.walk * (1 - sit) * (1 - lie) * (1 - air) * (1 - roll);
    const run = s.run;
    const ph = s.phase;

    // Gövde: oturunca ön taraf kalkar (eksi), sinince ve gerinince öne eğilir; yürürken hafif sallanır.
    const bound = walk * run;
    const pitch = -0.38 * sit + 0.1 * cr + 0.32 * stretch + (air ? -0.25 * s.rise * air : 0) + bound * Math.sin(ph) * 0.14;
    // Yuvarlanınca gövde uzun ekseni çevresinde döner (göbek yukarı), kıpır kıpır sallanır.
    const rollZ = roll * s.rollSide * (2.5 + Math.sin(s.t * 5) * 0.12);
    this.pivot.rotation.set(pitch * (1 - roll), cr * Math.sin(s.t * 17) * 0.12, rollZ + s.lean * 0.22, "XYZ");
    const bob = walk * Math.abs(Math.cos(ph)) * (0.006 + 0.012 * run);
    this.pivot.position.y = 0.09 - 0.062 * sit - 0.05 * lie - 0.03 * cr + 0.02 * stretch + bob + 0.035 * roll;
    this.pivot.position.z = -0.11 + 0.02 * sit;
    const br = 1 + 0.02 * s.breathe;
    this.torso.scale.set(0.105 * br * (1 + 0.06 * lie), 0.095 * br * (1 - 0.08 * lie), 0.15);

    // Bacaklar: dünyaya göre istenen açı - gövde eğimi = kalçanın kendi açısı. Artı x: ayak geriye.
    for (const [i, leg] of this.legs.entries()) {
      const front = leg.front;
      // Çapraz çiftler (yürüyüş) ya da ön ve arka çift birlikte (sıçrayarak koşu).
      const diag = (leg.side > 0) === front ? 0 : Math.PI;
      const lp = run > 0.5 ? ph + (front ? 0 : Math.PI) : ph + diag;
      const amp = 0.45 + 0.35 * run;
      let hip = walk * Math.sin(lp) * amp;
      let knee = walk * Math.max(0, Math.cos(lp)) * (front ? -0.7 : 0.9) * (0.8 + 0.5 * run);
      if (front) {
        hip += sit * 0.12 + lie * -1.45 + cr * -0.55 + air * (-0.8 - 0.3 * s.rise) + stretch * -1.15;
        knee += lie * 0.25 + cr * 0.95 + air * 0.1 + stretch * 0.1;
        if (i === 0 && groom > 0) {
          // Sağ ön pati yüze: yalanır.
          const lick = Math.sin(s.t * 9) * 0.12;
          hip += groom * (-2.2 + lick);
          knee += groom * (2.0 - sit * 0.12);
        }
        // Yoğurma: ön patiler sırayla basar; dirsekler bükülüp açılır.
        const kn = Math.sin(s.t * 6.5 + (leg.side > 0 ? 0 : Math.PI));
        hip += knead * (-0.35 + 0.3 * kn);
        knee += knead * (0.45 + 0.45 * Math.max(0, kn));
        // Pati sallama: sağ ön pati yanağın hizasında sallanır.
        if (i === 0) {
          hip += wave * (-2.75 + Math.sin(s.t * 11) * 0.22);
          knee += wave * (0.15 + Math.sin(s.t * 11 + 1) * 0.25);
        }
        // Sırtüstü: patiler havada, bükük; sırayla kıpırdar.
        hip += roll * (-0.9 + Math.sin(s.t * 3 + i) * 0.15);
        knee += roll * 1.1;
      } else {
        hip += sit * -1.15 + lie * -1.35 + cr * -0.75 + air * (0.9 + 0.2 * s.rise) + stretch * 0.15 + roll * (-0.7 + Math.sin(s.t * 3 + i) * 0.15);
        knee += sit * 2.45 + lie * 2.6 + cr * 1.35 + air * 0.15 + roll * 1.3;
      }
      leg.hip.rotation.set(hip - pitch, 0, 0);
      leg.knee.rotation.set(knee, 0, 0);
    }

    // Baş: bakış, eğim; oturunca gövdeyi dengeler; yatınca patilerinin üstüne iner.
    this.head.position.set(this.headBase.x, this.headBase.y - 0.035 * lie + walk * Math.abs(Math.sin(ph)) * 0.004, this.headBase.z + 0.012 * lie);
    const groomTilt = groom * (0.35 + Math.sin(s.t * 9) * 0.05);
    // Yuvarlanınca baş kameraya döner (ters durmasın).
    this.head.rotation.set(-pitch * 0.85 * (1 - roll) + 0.22 * lie - s.headPitch + groomTilt * 0.6, s.headYaw + 0.35 * lie, s.headTilt + 0.18 * lie + groomTilt * 0.4 - rollZ * 0.55 - s.lean * 0.12);

    // Kuyruk: dik (selam, mırlama), sallanır; otururken yere iner ve yana kıvrılır; yatınca gövdeye sarılır.
    // Otururken ve yatarken kuyruk geriye-aşağı iner, yere değip gövdenin yanından öne kıvrılır.
    const curl = Math.max(sit, lie) * (1 - roll);
    for (const [i, j] of this.tail.entries()) {
      const sway = Math.sin(s.t * s.tailSpeed - i * 0.6) * s.tailSwish * (1 - curl * 0.8);
      let x = i === 0 ? -0.5 : 0.18;
      x += s.tailUp * (i === 0 ? 0.35 : -0.05) * (1 - curl);
      x += curl * (i === 0 ? -1.45 : -0.18);
      x += air * (i === 0 ? -0.6 : -0.05);
      x += stretch * (i === 0 ? 0.3 : 0);
      const z = curl * (i === 0 ? 0 : 0.38) + sway;
      j.rotation.set(x - (i === 0 ? pitch : 0), curl * (i === 0 ? 1.0 : 0), z, i === 0 ? "YXZ" : "XYZ");
    }

    // Kulaklar.
    for (const ear of this.ears) {
      const side = ear.userData.side as number;
      const flat = Math.max(0, -s.ears);
      const tw = s.earTwitch * (side > 0 ? 1 : 0.3);
      ear.rotation.set(-0.15 - 0.5 * flat + tw * 0.4, 0, -side * (0.32 + 0.55 * flat + tw * 0.3));
    }

    // Yüz.
    const open = s.eyes === "open" || s.eyes === "surprised";
    const big = s.eyes === "surprised" ? 1.15 : 1;
    for (const e of this.eyes) {
      e.visible = open && s.eyeOpen > 0.08;
      e.scale.set(big, big * Math.max(0.08, s.eyeOpen), big);
    }
    for (const pu of this.pupils) pu.position.set(s.lookX * 0.006, s.lookY * 0.006, 0);
    for (const e of this.eyesHappy) e.visible = s.eyes === "happy";
    for (const e of this.eyesClosed) e.visible = s.eyes === "closed" || (open && s.eyeOpen <= 0.08);
    for (const b of this.blushes) (b.material as MeshBasicMaterial).opacity = 0.25 + 0.5 * s.blush;
    const o = Math.max(s.mouthOpen, s.eyes === "surprised" ? 0.8 : 0);
    this.mouthO.visible = o > 0.05;
    this.mouthO.scale.set(0.011, 0.006 + 0.01 * o, 0.004);
    for (const m of this.mouth) m.visible = o < 0.5;
  }

  /** Ayakta durduğu dinlenme pozunda boyu (kulak ucu, m). */
  static readonly HEIGHT = 0.39;
}
