import { Kediler, type KedilerOptions } from "./Kediler";
export { Kediler, Kedi, type KedilerOptions, type CatOptions, type CatMood } from "./Kediler";
export { ChibiCat, PALETTES, ORANGE_TABBY, BLACK_CAT, WHITE_CAT, GRAY_TABBY, restPose, type CatPalette, type CatColor, type PoseState, type EyeMode } from "./ChibiCat";
/** Kedileri sayfaya koyar. `destroy()` ile kaldırılır. */
export declare function start(options?: KedilerOptions): Kediler;
