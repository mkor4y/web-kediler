# Web Kediler 🐾

Sitenizin altında yaşayan, tamamen kodla çizilmiş anime kediler. Model dosyası yok, resim yok: her kedi three.js ile basit şekillerden çiziliyor ve kemik kemik canlandırılıyor.

*Animated, procedurally drawn anime cats that live at the bottom of any web page. [English below](#english).*

## Ne yapıyorlar?

- **İmleci izlerler.** Fare sayfanın alt yarısındayken peşinden gelirler; imleç yerde kıpırdarsa sinip üstüne atlarlar.
- **Sevilirler.** Kediye tıklayınca (dokununca) mırlar, kalpler uçar; bazen sırtüstü yuvarlanır.
- **Kendi hayatları var.** Oturur, yalanır, gerinir, esner, uyur (yanına gelince uyanır), dolaşır; birbirini kovalar, birbirinin başını yalar.
- **Yumak.** `yarn()` ile yere yumak atarsınız; yarışırlar, önce varan yakalar.
- **Hafif ve saygılı.** Sayfanın stillerine dokunmaz (Shadow DOM), tıklamaları engellemez (yalnızca kedinin kendisi tıklanır), sekme gizliyken durur, "hareketi azalt" tercihine uyar.

Renkler: `orange` (turuncu tekir), `black` (siyah), `white` (beyaz), `gray` (gri tekir).

## Sitene ekle: tek satır

```html
<script src="https://cdn.jsdelivr.net/gh/mkor4y/web-kediler@main/dist/web-kediler.js" data-cats="orange,black"></script>
```

`</body>` öncesine koymanız yeter. Ayarlar (hepsi isteğe bağlı):

| Öznitelik | Örnek | Anlamı |
| --- | --- | --- |
| `data-cats` | `orange,black,white,gray` | Hangi kediler, hangi sırayla |
| `data-size` | `100` | Kedinin boyu (piksel). Varsayılan ekrana göre 70–120 |
| `data-follow` | `false` | İmleci izlemesinler |
| `data-autonomy` | `false` | Kendi kendilerine iş yapmasınlar (yalnızca izlesinler, sevilsinler) |
| `data-floor` | `56` | Altta sabit bir çubuk varsa yüksekliği; kediler onun üstünde yürür |
| `data-z` | `9999` | z-index |
| `data-auto` | `false` | Kendileri başlamasın; `WebKediler.start({...})` ile siz başlatın |

Betik yüklendikten sonra `WebKediler.instance` üzerinden yönetebilirsiniz:

```js
WebKediler.instance.yarn();     // yumak at
WebKediler.instance.wave();     // hepsi pati sallasın
WebKediler.instance.destroy();  // kedileri kaldır
```

## Paketleyiciyle (Vite, webpack…)

```bash
npm install github:mkor4y/web-kediler three
```

```ts
import { start } from "web-kediler";

const kediler = start({
  cats: ["orange", { color: "black", name: "Kömür", sleepy: 0.9 }],
  size: 96,
  followCursor: true,
});
// kediler.yarn(); kediler.wave(); kediler.destroy();
```

ES modülü `three`'yi sitenizin kendi kopyasından alır (0.160 ve üstü). Kendi renklerinizi de verebilirsiniz: `{ palette: { ...PALETTES.orange, coat: 0xd9a066 } }`.

## Geliştirme

```bash
npm install
npm run dev      # demo: http://localhost:5173/demo/
npm run check    # tür denetimi
npm run build    # dist/
```

`dist/` depoda tutulur ki jsDelivr bağlantısı derleme gerektirmeden çalışsın.

## Lisans

MIT © mkor4y

---

## English

Procedurally drawn anime cats for any web page. There are no model files and no sprites: each cat is built from three.js primitives and animated joint by joint.

**What they do**

- Follow your cursor along the bottom of the page.
- Pounce when the cursor moves near the floor.
- Purr when clicked, and sometimes roll over.
- Groom, stretch, yawn and nap on their own.
- Chase each other and groom each other.
- Race for a ball of yarn.

**How they behave on your page**

- Shadow DOM keeps your page's styles untouched.
- Only the cats themselves catch clicks.
- They pause when the tab is hidden.
- They respect reduced-motion settings.

**Add with one line:**

```html
<script src="https://cdn.jsdelivr.net/gh/mkor4y/web-kediler@main/dist/web-kediler.js" data-cats="orange,black"></script>
```

**Options:**

- `data-cats`: `orange`, `black`, `white`, `gray`.
- `data-size`: cat height in pixels.
- `data-follow="false"`: don't follow the cursor.
- `data-autonomy="false"`: no idle behaviors of their own.
- `data-floor`: height of a fixed bottom bar, so the cats walk on top of it.
- `data-z`: z-index.
- `data-auto="false"`: don't start automatically. Call `WebKediler.start({...})` yourself.

**Control:** after loading, use `WebKediler.instance.yarn()`, `.wave()` or `.destroy()`.

**With a bundler:** `npm install github:mkor4y/web-kediler three`, then `import { start } from "web-kediler"`. The ES build uses your own `three` (0.160 or newer).

MIT licensed.
