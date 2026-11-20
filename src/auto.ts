/**
 * Tek satırla ekleme:
 *   <script src="https://cdn.jsdelivr.net/gh/mkor4y/web-kediler@v0.1.0/dist/web-kediler.js" data-cats="orange,black"></script>
 *
 * Ayarlar (hepsi isteğe bağlı): data-cats="orange,black,white,gray", data-size="100" (piksel),
 * data-follow="false" (imleci izlemesinler), data-floor="0" (altta sabit çubuk varsa yüksekliği),
 * data-z="9999", data-auto="false" (kendileri başlamasın; `WebKediler.start({...})` ile başlatın).
 */
import { PALETTES, type CatColor } from "./ChibiCat";
import { start, Kediler, Kedi, ChibiCat, PALETTES as P } from "./index";
import type { KedilerOptions } from "./Kediler";

const script = document.currentScript as HTMLScriptElement | null;
const api = { start, Kediler, Kedi, ChibiCat, PALETTES: P, instance: null as Kediler | null };
(window as unknown as { WebKediler: typeof api }).WebKediler = api;

function options(el: HTMLScriptElement | null): KedilerOptions {
  const d = el?.dataset ?? {};
  const o: KedilerOptions = {};
  if (d.cats) {
    const cats = d.cats
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is CatColor => s in PALETTES);
    if (cats.length) o.cats = cats;
  }
  const num = (v?: string) => (v && Number.isFinite(Number(v)) ? Number(v) : undefined);
  o.size = num(d.size);
  o.floorOffset = num(d.floor);
  o.zIndex = num(d.z);
  if (d.follow === "false") o.followCursor = false;
  if (d.autonomy === "false") o.autonomy = false;
  return o;
}

if (script?.dataset.auto !== "false") {
  const go = () => (api.instance = start(options(script)));
  if (document.body) go();
  else addEventListener("DOMContentLoaded", go, { once: true });
}
