import { OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { ChibiCat, type CatColor, type CatPalette } from "./ChibiCat";
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
export type CatMood = "walk" | "sit" | "sleep" | "purr" | "crouch" | "air" | "spin" | "chase" | "groom" | "stretch" | "play" | "roll" | "wave" | "yawn" | "cuddle";
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
export declare class Kedi {
    private readonly world;
    x: number;
    y: number;
    name: string;
    readonly model: ChibiCat;
    readonly canvas: HTMLCanvasElement;
    readonly playful: number;
    readonly sleepy: number;
    /** Ekranın bir yanını sever (diğer kediyle üst üste binmesin). */
    readonly side: number;
    private readonly ctx;
    private yaw;
    private yawGoal;
    private speed;
    private phase;
    private readonly p;
    private sitW;
    private lieW;
    private crouchW;
    private airW;
    private groomW;
    private stretchW;
    private rollW;
    private waveW;
    private t;
    private stillFor;
    activity: Activity | null;
    private jump;
    private lastPounce;
    private nextIdle;
    private blinkT;
    private blink;
    private twitchT;
    private fxT;
    private flush;
    private trash;
    constructor(opts: CatOptions, index: number, world: Kediler);
    get h(): number;
    /** Okşandı: mırlar ("^^") ya da arada sırtüstü yuvarlanır; kalpler uçar. */
    pet(): void;
    /** Pati sallar. */
    wave(): void;
    visit(other: Kedi): void;
    beGroomed(seconds: number, by: Kedi): void;
    flee(x: number): void;
    chase(other: Kedi): void;
    chaseYarn(el: HTMLElement, from: number, to: number): void;
    lostYarn(): void;
    get idle(): boolean;
    hitTest(px: number, py: number, slop?: number): boolean;
    mood(): CatMood;
    update(dt: number): void;
    private think;
    /** Boşta, kişiliğine göre: yalanır, gerinir, esner, uyur, dolaşır, öbür kediyle oynar ya da koklaşır. */
    private idleThought;
    /** İmleç yerde, yakında kıpırdıyorsa: siner ve üstüne atlar. */
    private maybePounce;
    private faceToward;
    private leap;
    private updateJump;
    private pose;
    /** Kedinin çevresini ortak çizicide çizer ve kendi tuvaline kopyalar. */
    render(renderer: WebGLRenderer, camera: OrthographicCamera, box: number): void;
    fx(text: string, count: number): void;
    say(text: string): void;
}
/** Kediler: sahne, ortak çizici, imleç, kediler arası işler (kovalamaca, koklaşma, yumak). */
export declare class Kediler {
    readonly scene: Scene<import("three").Object3DEventMap>;
    readonly cats: Kedi[];
    readonly root: ShadowRoot;
    readonly host: HTMLElement;
    pointer: {
        x: number;
        y: number;
        at: number;
    } | null;
    t: number;
    autonomy: boolean;
    followCursor: boolean;
    readonly reducedMotion: boolean;
    /** Kedi boyu (piksel). */
    size: number;
    /** Metre başına piksel (model ölçeğinde: kedinin boyu ~0,39 m). */
    ppm: number;
    private readonly fixedSize;
    private readonly floorOffset;
    private readonly renderer;
    private readonly camera;
    private box;
    private tagCooldown;
    private cuddleCooldown;
    private last;
    private raf;
    private stopped;
    private readonly software;
    private readonly off;
    constructor(options?: KedilerOptions);
    private listen;
    private resize;
    /** Zeminin ekran y'si (piksel). */
    floor(): number;
    toWorld(px: number, py: number, out: Vector3): Vector3;
    indexOf(cat: Kedi): number;
    private loop;
    /** Zamanı elle ilerletir (test için). */
    step(dt: number): void;
    /** İki kedi boştaysa: biri kaçar, öbürü kovalar. */
    startTag(cat: Kedi): void;
    /** Bir kedi öbürünün yanına gidip başını yalar. */
    startCuddle(cat: Kedi): void;
    /** Yere bir yumak atar; kediler kovalar, önce varan yakalar. `x` verilmezse kedilerin ortasından. */
    yarn(x?: number): void;
    placeYarn(el: HTMLElement, x: number, top: number, deg: number): void;
    yarnCaught(winner: Kedi): void;
    /** Bütün kediler pati sallar. */
    wave(): void;
    /** Kedileri kaldırır. */
    destroy(): void;
}
export {};
