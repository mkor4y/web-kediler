import { Group } from "three";
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
export declare const ORANGE_TABBY: CatPalette;
export declare const BLACK_CAT: CatPalette;
export declare const WHITE_CAT: CatPalette;
export declare const GRAY_TABBY: CatPalette;
export declare const PALETTES: {
    readonly orange: CatPalette;
    readonly black: CatPalette;
    readonly white: CatPalette;
    readonly gray: CatPalette;
};
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
export declare const restPose: () => PoseState;
export declare class ChibiCat {
    readonly palette: CatPalette;
    readonly root: Group<import("three").Object3DEventMap>;
    /** Arka kalçada döner (oturunca ön taraf kalkar); alçalma da burada. */
    private readonly pivot;
    private readonly torso;
    private readonly head;
    private readonly headBase;
    private readonly legs;
    private readonly tail;
    private readonly ears;
    private readonly eyes;
    private readonly pupils;
    private readonly eyesHappy;
    private readonly eyesClosed;
    private readonly blushes;
    private readonly mouth;
    private readonly mouthO;
    private readonly line;
    constructor(palette: CatPalette);
    /** Kontürlü parça: biraz büyütülmüş, arka yüzü çizilen koyu kopya (dışbükey şekiller için). */
    private part;
    /** Pozu uygular (her kare; mutlak açılar, birikmez). */
    apply(s: PoseState): void;
    /** Ayakta durduğu dinlenme pozunda boyu (kulak ucu, m). */
    static readonly HEIGHT = 0.39;
}
