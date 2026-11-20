import { AmbientLight, BackSide, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, ConeGeometry, DataTexture, DirectionalLight, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, NearestFilter, Object3D, OrthographicCamera, RedFormat, SRGBColorSpace, Scene, SphereGeometry, TubeGeometry, Vector3, WebGLRenderer } from "three";
// \0@oxc-project+runtime@0.156.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
// src/ChibiCat.ts
var ORANGE_TABBY = {
	coat: 16032335,
	stripe: 14710828,
	chest: 16774114,
	paws: 16774114,
	muzzle: 16774114,
	earInner: 16755133,
	nose: 16744346,
	iris: 8012072,
	pupil: 2759202,
	ink: 3810328,
	whisker: 3810328,
	blush: 16748456,
	tailTip: 16774114
};
var BLACK_CAT = {
	coat: 3420221,
	stripe: null,
	chest: 4209227,
	paws: 3420221,
	muzzle: 4603983,
	earInner: 13076636,
	nose: 15043232,
	iris: 14145098,
	pupil: 1446428,
	ink: 1183511,
	whisker: 15394546,
	blush: 16748456,
	tailTip: 3420221
};
var WHITE_CAT = {
	coat: 16513268,
	stripe: null,
	chest: 16777215,
	paws: 16777215,
	muzzle: 16777215,
	earInner: 16757700,
	nose: 16747173,
	iris: 5941472,
	pupil: 2042426,
	ink: 5917266,
	whisker: 9075330,
	blush: 16751280,
	tailTip: 16513268
};
var GRAY_TABBY = {
	coat: 10133676,
	stripe: 7107200,
	chest: 15264495,
	paws: 15264495,
	muzzle: 15659252,
	earInner: 15771832,
	nose: 15239068,
	iris: 7059562,
	pupil: 1909792,
	ink: 2895672,
	whisker: 2895672,
	blush: 16751280,
	tailTip: 7107200
};
var PALETTES = {
	orange: ORANGE_TABBY,
	black: BLACK_CAT,
	white: WHITE_CAT,
	gray: GRAY_TABBY
};
var restPose = () => ({
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
	tailSwish: .25,
	tailSpeed: 1.6,
	tailUp: 0,
	ears: 1,
	earTwitch: 0,
	eyes: "open",
	eyeOpen: 1,
	lookX: 0,
	lookY: 0,
	blush: .5,
	mouthOpen: 0,
	breathe: 0
});
function gradient() {
	const t = new DataTexture(new Uint8Array([
		95,
		175,
		255
	]), 3, 1, RedFormat);
	t.minFilter = t.magFilter = NearestFilter;
	t.needsUpdate = true;
	return t;
}
var GRAD = null;
/** Tekir çizgileri: kafanın ve gövdenin dokusu (beyaz zemin, rengi malzeme verir). */
function tabby(stripes, color, coat) {
	const c = document.createElement("canvas");
	c.width = 512;
	c.height = 256;
	const g = c.getContext("2d");
	g.fillStyle = "#ffffff";
	g.fillRect(0, 0, 512, 256);
	const ch = (v, s) => Math.min(255, Math.round((v >> s & 255) / Math.max(1, coat >> s & 255) * 255));
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
var ChibiCat = class {
	constructor(palette) {
		_defineProperty(this, "palette", void 0);
		_defineProperty(this, "root", new Group());
		_defineProperty(
			this,
			/** Arka kalçada döner (oturunca ön taraf kalkar); alçalma da burada. */
			"pivot",
			new Object3D()
		);
		_defineProperty(this, "torso", void 0);
		_defineProperty(this, "head", new Object3D());
		_defineProperty(this, "headBase", new Vector3());
		_defineProperty(this, "legs", []);
		_defineProperty(this, "tail", []);
		_defineProperty(this, "ears", []);
		_defineProperty(this, "eyes", []);
		_defineProperty(this, "pupils", []);
		_defineProperty(this, "eyesHappy", []);
		_defineProperty(this, "eyesClosed", []);
		_defineProperty(this, "blushes", []);
		_defineProperty(this, "mouth", []);
		_defineProperty(this, "mouthO", void 0);
		_defineProperty(this, "line", void 0);
		this.palette = palette;
		GRAD ?? (GRAD = gradient());
		const p = palette;
		this.line = new MeshBasicMaterial({
			color: p.ink,
			side: BackSide
		});
		const toon = (color, map) => new MeshToonMaterial({
			color,
			gradientMap: GRAD,
			map: map ?? null
		});
		const R = .12;
		this.pivot.position.set(0, .09, -.11);
		this.root.add(this.pivot);
		const rel = (x, y, z) => new Vector3(x, y - .09, z + .11);
		this.torso = this.part(new SphereGeometry(1, 40, 28), toon(p.coat, p.stripe === null ? void 0 : tabby(4, p.stripe, p.coat)));
		this.torso.scale.set(.105, .095, .15);
		this.torso.position.copy(rel(0, .115, -.02));
		this.pivot.add(this.torso);
		const chest = this.part(new SphereGeometry(1, 28, 20), toon(p.chest), 0);
		chest.scale.set(.07, .075, .06);
		chest.position.copy(rel(0, .12, .09));
		this.pivot.add(chest);
		const upper = new CapsuleGeometry(.027, .03, 6, 14);
		const lower = new CapsuleGeometry(.024, .03, 6, 14);
		const pawGeo = new SphereGeometry(1, 20, 14);
		for (const [x, z, front] of [
			[
				.058,
				.085,
				true
			],
			[
				-.058,
				.085,
				true
			],
			[
				.06,
				-.11,
				false
			],
			[
				-.06,
				-.11,
				false
			]
		]) {
			const hip = new Object3D();
			hip.position.copy(rel(x, .1, z));
			const up = this.part(upper, toon(p.coat));
			up.position.y = -.022;
			const knee = new Object3D();
			knee.position.y = -.044;
			const lo = this.part(lower, toon(p.coat));
			lo.position.y = -.02;
			const paw = this.part(pawGeo, toon(p.paws));
			paw.scale.set(.031, .022, .036);
			paw.position.set(0, -.046, .008);
			knee.add(lo, paw);
			hip.add(up, knee);
			this.pivot.add(hip);
			this.legs.push({
				hip,
				knee,
				front,
				side: Math.sign(x)
			});
		}
		let parent = this.pivot;
		const seg = .043;
		for (let i = 0; i < 6; i++) {
			const j = new Object3D();
			if (i === 0) j.position.copy(rel(0, .15, -.155));
			else j.position.set(0, seg, 0);
			const r = .026 - i * .0017;
			const color = i >= 5 ? p.tailTip : p.stripe !== null && i % 2 ? p.stripe : p.coat;
			const piece = this.part(new CapsuleGeometry(r, seg * .7, 6, 14), toon(color));
			piece.position.y = seg / 2;
			j.add(piece);
			parent.add(j);
			this.tail.push(j);
			parent = j;
		}
		this.headBase.copy(rel(0, .255, .075));
		this.head.position.copy(this.headBase);
		this.pivot.add(this.head);
		const skull = this.part(new SphereGeometry(1, 48, 32), toon(p.coat, p.stripe === null ? void 0 : tabby(3, p.stripe, p.coat)));
		skull.scale.set(R * 1.12, R * .95, R);
		this.head.add(skull);
		for (const s of [-1, 1]) {
			const cheek = this.part(new SphereGeometry(1, 24, 16), toon(p.coat), .005);
			cheek.scale.set(.05, .04, .05);
			cheek.position.set(s * .085, -.045, .03);
			this.head.add(cheek);
		}
		const muzzle = this.part(new SphereGeometry(1, 28, 20), toon(p.muzzle), 0);
		muzzle.scale.set(.055, .036, .03);
		muzzle.position.set(0, -.045, R * .9);
		this.head.add(muzzle);
		for (const s of [-1, 1]) {
			const ear = new Object3D();
			ear.position.set(s * .068, .085, -.005);
			ear.userData.side = s;
			const outer = this.part(new ConeGeometry(.048, .085, 4, 1), toon(p.coat));
			outer.rotation.y = Math.PI / 4;
			outer.position.y = .035;
			const inner = this.part(new ConeGeometry(.03, .06, 4, 1), toon(p.earInner), 0);
			inner.rotation.y = Math.PI / 4;
			inner.position.set(0, .03, .016);
			ear.add(outer, inner);
			this.head.add(ear);
			this.ears.push(ear);
		}
		const inkM = new MeshBasicMaterial({ color: p.pupil });
		const irisM = new MeshBasicMaterial({ color: p.iris });
		const white = new MeshBasicMaterial({ color: 16777215 });
		const lineM = new MeshBasicMaterial({ color: p.ink === p.pupil ? p.ink : p.pupil });
		const ball = new SphereGeometry(1, 24, 16);
		const facing = (at) => {
			const o = new Object3D();
			o.position.copy(at);
			o.lookAt(at.clone().multiplyScalar(2));
			this.head.add(o);
			return o;
		};
		for (const s of [-1, 1]) {
			const at = new Vector3(s * .05, 0, R * .93);
			const eye = facing(at);
			const rim = new Mesh(ball, inkM);
			rim.scale.set(.026, .034, .008);
			const look = new Object3D();
			const ir = new Mesh(ball, irisM);
			ir.scale.set(.019, .025, .006);
			ir.position.set(0, -.004, .004);
			const pu = new Mesh(ball, inkM);
			pu.scale.set(.01, .017, .004);
			pu.position.set(0, -.004, .007);
			const g1 = new Mesh(ball, white);
			g1.scale.set(.009, .011, .004);
			g1.position.set(-s * .008, .012, .009);
			const g2 = new Mesh(ball, white);
			g2.scale.setScalar(.0045);
			g2.position.set(s * .009, -.013, .009);
			look.add(ir, pu, g1, g2);
			eye.add(rim, look);
			this.eyes.push(eye);
			this.pupils.push(look);
			const arc = (up) => {
				const pts = [
					-1,
					-.5,
					0,
					.5,
					1
				].map((u) => new Vector3(u * .022, (up ? 1 : -1) * (.012 - .012 * u * u), 0));
				const o = facing(at);
				o.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 16, .0042, 6), lineM));
				o.visible = false;
				return o;
			};
			this.eyesHappy.push(arc(true));
			this.eyesClosed.push(arc(false));
			const blush = new Mesh(ball, new MeshBasicMaterial({
				color: p.blush,
				transparent: true,
				opacity: .5,
				depthWrite: false
			}));
			blush.scale.set(.022, .011, .004);
			const bAt = new Vector3(s * .072, -.026, R * .88);
			blush.position.copy(bAt);
			blush.lookAt(bAt.clone().multiplyScalar(2));
			this.head.add(blush);
			this.blushes.push(blush);
		}
		const front = .138;
		const nose = new Mesh(new SphereGeometry(1, 16, 10), toon(p.nose));
		nose.scale.set(.012, .008, .008);
		nose.position.set(0, -.034, .14200000000000002);
		this.head.add(nose);
		const mouthPts = (s) => [
			0,
			.5,
			1
		].map((u) => new Vector3(s * u * .016, -.004 - Math.sin(u * Math.PI) * .007, 0));
		for (const s of [-1, 1]) {
			const m = new Mesh(new TubeGeometry(new CatmullRomCurve3(mouthPts(s)), 12, .0026, 6), lineM);
			m.position.set(0, -.05, .14);
			this.head.add(m);
			this.mouth.push(m);
		}
		this.mouthO = new Mesh(ball, new MeshBasicMaterial({ color: 8006714 }));
		this.mouthO.scale.set(.011, .013, .004);
		this.mouthO.position.set(0, -.062, front);
		this.mouthO.visible = false;
		this.head.add(this.mouthO);
		const whiskerM = new MeshBasicMaterial({ color: p.whisker });
		for (const s of [-1, 1]) for (const k of [
			-1,
			0,
			1
		]) {
			const pts = [new Vector3(s * .06, -.035 + k * .008, R * .85), new Vector3(s * .15, -.03 + k * .022, R * .55)];
			this.head.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(pts), 2, .0012, 4), whiskerM));
		}
	}
	/** Kontürlü parça: biraz büyütülmüş, arka yüzü çizilen koyu kopya (dışbükey şekiller için). */
	part(geo, mat, outline = .006) {
		const m = new Mesh(geo, mat);
		if (outline > 0) {
			geo.computeBoundingSphere();
			const o = new Mesh(geo, this.line);
			o.scale.setScalar(1 + outline / geo.boundingSphere.radius);
			m.add(o);
		}
		return m;
	}
	/** Pozu uygular (her kare; mutlak açılar, birikmez). */
	apply(s) {
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
		const bound = walk * run;
		const pitch = -.38 * sit + .1 * cr + .32 * stretch + (air ? -.25 * s.rise * air : 0) + bound * Math.sin(ph) * .14;
		const rollZ = roll * s.rollSide * (2.5 + Math.sin(s.t * 5) * .12);
		this.pivot.rotation.set(pitch * (1 - roll), cr * Math.sin(s.t * 17) * .12, rollZ + s.lean * .22, "XYZ");
		const bob = walk * Math.abs(Math.cos(ph)) * (.006 + .012 * run);
		this.pivot.position.y = .09 - .062 * sit - .05 * lie - .03 * cr + .02 * stretch + bob + .035 * roll;
		this.pivot.position.z = -.11 + .02 * sit;
		const br = 1 + .02 * s.breathe;
		this.torso.scale.set(.105 * br * (1 + .06 * lie), .095 * br * (1 - .08 * lie), .15);
		for (const [i, leg] of this.legs.entries()) {
			const front = leg.front;
			const diag = leg.side > 0 === front ? 0 : Math.PI;
			const lp = run > .5 ? ph + (front ? 0 : Math.PI) : ph + diag;
			const amp = .45 + .35 * run;
			let hip = walk * Math.sin(lp) * amp;
			let knee = walk * Math.max(0, Math.cos(lp)) * (front ? -.7 : .9) * (.8 + .5 * run);
			if (front) {
				hip += sit * .12 + lie * -1.45 + cr * -.55 + air * (-.8 - .3 * s.rise) + stretch * -1.15;
				knee += lie * .25 + cr * .95 + air * .1 + stretch * .1;
				if (i === 0 && groom > 0) {
					const lick = Math.sin(s.t * 9) * .12;
					hip += groom * (-2.2 + lick);
					knee += groom * (2 - sit * .12);
				}
				const kn = Math.sin(s.t * 6.5 + (leg.side > 0 ? 0 : Math.PI));
				hip += knead * (-.35 + .3 * kn);
				knee += knead * (.45 + .45 * Math.max(0, kn));
				if (i === 0) {
					hip += wave * (-2.75 + Math.sin(s.t * 11) * .22);
					knee += wave * (.15 + Math.sin(s.t * 11 + 1) * .25);
				}
				hip += roll * (-.9 + Math.sin(s.t * 3 + i) * .15);
				knee += roll * 1.1;
			} else {
				hip += sit * -1.15 + lie * -1.35 + cr * -.75 + air * (.9 + .2 * s.rise) + stretch * .15 + roll * (-.7 + Math.sin(s.t * 3 + i) * .15);
				knee += sit * 2.45 + lie * 2.6 + cr * 1.35 + air * .15 + roll * 1.3;
			}
			leg.hip.rotation.set(hip - pitch, 0, 0);
			leg.knee.rotation.set(knee, 0, 0);
		}
		this.head.position.set(this.headBase.x, this.headBase.y - .035 * lie + walk * Math.abs(Math.sin(ph)) * .004, this.headBase.z + .012 * lie);
		const groomTilt = groom * (.35 + Math.sin(s.t * 9) * .05);
		this.head.rotation.set(-pitch * .85 * (1 - roll) + .22 * lie - s.headPitch + groomTilt * .6, s.headYaw + .35 * lie, s.headTilt + .18 * lie + groomTilt * .4 - rollZ * .55 - s.lean * .12);
		const curl = Math.max(sit, lie) * (1 - roll);
		for (const [i, j] of this.tail.entries()) {
			const sway = Math.sin(s.t * s.tailSpeed - i * .6) * s.tailSwish * (1 - curl * .8);
			let x = i === 0 ? -.5 : .18;
			x += s.tailUp * (i === 0 ? .35 : -.05) * (1 - curl);
			x += curl * (i === 0 ? -1.45 : -.18);
			x += air * (i === 0 ? -.6 : -.05);
			x += stretch * (i === 0 ? .3 : 0);
			const z = curl * (i === 0 ? 0 : .38) + sway;
			j.rotation.set(x - (i === 0 ? pitch : 0), curl * (i === 0 ? 1 : 0), z, i === 0 ? "YXZ" : "XYZ");
		}
		for (const ear of this.ears) {
			const side = ear.userData.side;
			const flat = Math.max(0, -s.ears);
			const tw = s.earTwitch * (side > 0 ? 1 : .3);
			ear.rotation.set(-.15 - .5 * flat + tw * .4, 0, -side * (.32 + .55 * flat + tw * .3));
		}
		const open = s.eyes === "open" || s.eyes === "surprised";
		const big = s.eyes === "surprised" ? 1.15 : 1;
		for (const e of this.eyes) {
			e.visible = open && s.eyeOpen > .08;
			e.scale.set(big, big * Math.max(.08, s.eyeOpen), big);
		}
		for (const pu of this.pupils) pu.position.set(s.lookX * .006, s.lookY * .006, 0);
		for (const e of this.eyesHappy) e.visible = s.eyes === "happy";
		for (const e of this.eyesClosed) e.visible = s.eyes === "closed" || open && s.eyeOpen <= .08;
		for (const b of this.blushes) b.material.opacity = .25 + .5 * s.blush;
		const o = Math.max(s.mouthOpen, s.eyes === "surprised" ? .8 : 0);
		this.mouthO.visible = o > .05;
		this.mouthO.scale.set(.011, .006 + .01 * o, .004);
		for (const m of this.mouth) m.visible = o < .5;
	}
};
_defineProperty(ChibiCat, "HEIGHT", .39);
// src/Kediler.ts
var STRIDE = .2;
var CSS = `
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
var damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
var smooth = (x) => x * x * (3 - 2 * x);
/** WebGL işlemcide mi çiziliyor (yazılımla çizim): kenar yumuşatma kapalı, piksel oranı 1. */
function softwareGL() {
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
var Kedi = class {
	constructor(opts, index, world) {
		_defineProperty(this, "world", void 0);
		_defineProperty(this, "x", void 0);
		_defineProperty(this, "y", 0);
		_defineProperty(this, "name", void 0);
		_defineProperty(this, "model", void 0);
		_defineProperty(this, "canvas", void 0);
		_defineProperty(this, "playful", void 0);
		_defineProperty(this, "sleepy", void 0);
		_defineProperty(
			this,
			/** Ekranın bir yanını sever (diğer kediyle üst üste binmesin). */
			"side",
			void 0
		);
		_defineProperty(this, "ctx", void 0);
		_defineProperty(this, "yaw", 0);
		_defineProperty(this, "yawGoal", 0);
		_defineProperty(this, "speed", 0);
		_defineProperty(this, "phase", 0);
		_defineProperty(this, "p", restPose());
		_defineProperty(this, "sitW", 0);
		_defineProperty(this, "lieW", 0);
		_defineProperty(this, "crouchW", 0);
		_defineProperty(this, "airW", 0);
		_defineProperty(this, "groomW", 0);
		_defineProperty(this, "stretchW", 0);
		_defineProperty(this, "rollW", 0);
		_defineProperty(this, "waveW", 0);
		_defineProperty(this, "t", 0);
		_defineProperty(this, "stillFor", 0);
		_defineProperty(this, "activity", null);
		_defineProperty(this, "jump", null);
		_defineProperty(this, "lastPounce", -99);
		_defineProperty(this, "nextIdle", 4 + Math.random() * 6);
		_defineProperty(this, "blinkT", 2);
		_defineProperty(this, "blink", 0);
		_defineProperty(this, "twitchT", 3);
		_defineProperty(this, "fxT", 0);
		_defineProperty(this, "flush", 0);
		_defineProperty(this, "trash", []);
		this.world = world;
		const palette = opts.palette ?? PALETTES[opts.color ?? "orange"] ?? PALETTES.orange;
		this.model = new ChibiCat(palette);
		this.model.root.traverse((o) => o.layers.set(1));
		world.scene.add(this.model.root);
		this.name = opts.name ?? "";
		this.playful = clamp(opts.playful ?? (index % 2 ? .45 : .9), 0, 1);
		this.sleepy = clamp(opts.sleepy ?? (index % 2 ? .8 : .25), 0, 1);
		this.side = index % 2 ? -1 : 1;
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		world.root.appendChild(this.canvas);
		const w = innerWidth;
		this.x = clamp(w * (.62 + (index % 2 ? -.1 : .12) + index * .05), 40, w - 40);
		this.blinkT = 1 + Math.random() * 3;
	}
	get h() {
		return this.world.size;
	}
	/** Okşandı: mırlar ("^^") ya da arada sırtüstü yuvarlanır; kalpler uçar. */
	pet() {
		if (this.jump) return;
		const roll = this.lieW < .5 && Math.random() < .15 + .25 * this.playful;
		this.activity = roll ? {
			kind: "roll",
			t: 0,
			dur: 2.6
		} : {
			kind: "purr",
			t: 0,
			dur: 2.4
		};
		this.flush = 1;
		this.fx("♥", 3);
		this.say(Math.random() < .5 ? "mrrr~" : "prrr♥");
	}
	/** Pati sallar. */
	wave() {
		if (!this.jump) this.activity = {
			kind: "wave",
			t: 0,
			dur: 1.6
		};
	}
	visit(other) {
		this.activity = {
			kind: "visit",
			t: 0,
			dur: 6,
			other
		};
	}
	beGroomed(seconds, by) {
		this.activity = {
			kind: "groomed",
			t: 0,
			dur: seconds,
			other: by
		};
	}
	flee(x) {
		this.activity = {
			kind: "flee",
			t: 0,
			dur: 2.2,
			x
		};
		this.say("mya!");
	}
	chase(other) {
		this.activity = {
			kind: "chaseCat",
			t: 0,
			dur: 4,
			other
		};
	}
	chaseYarn(el, from, to) {
		if (!this.jump) this.activity = {
			kind: "yarn",
			t: 0,
			dur: 6,
			el,
			x0: from,
			x: to
		};
	}
	lostYarn() {
		this.activity = {
			kind: "watch",
			t: 0,
			dur: 1.5
		};
	}
	get idle() {
		return !this.jump && !this.activity && this.stillFor > 1.5 && this.lieW < .3;
	}
	hitTest(px, py, slop = 0) {
		const h = this.h;
		const w = h * (.55 + .4 * Math.abs(Math.sin(this.yaw)));
		return Math.abs(px - this.x) < w / 2 + slop && py < this.y + 4 + slop && py > this.y - h * (1 - .35 * this.lieW) - slop;
	}
	mood() {
		const a = this.activity;
		if (this.jump) return "air";
		switch (a?.kind) {
			case "purr":
			case "spin":
			case "groom":
			case "stretch":
			case "roll":
			case "wave":
			case "yawn": return a.kind;
			case "yarn": return "chase";
			case "pounce": return "crouch";
			case "flee":
			case "chaseCat": return "play";
			case "visit":
			case "allogroom":
			case "groomed": return "cuddle";
		}
		if (this.lieW > .5) return "sleep";
		if (this.sitW > .5) return "sit";
		return "walk";
	}
	update(dt) {
		this.t += dt;
		if (this.trash.length) this.trash = this.trash.filter((x) => this.t < x.at ? true : (x.el.remove(), false));
		const floor = this.world.floor();
		if (this.jump) this.updateJump(dt, floor);
		else {
			this.y = floor;
			this.think(dt);
		}
		this.pose(dt);
	}
	think(dt) {
		const a = this.activity;
		const W = this.world;
		let targetX = this.x;
		let want = "stand";
		let maxSpeed = .55;
		if (a) a.t += dt;
		const done = a && a.t >= a.dur;
		const left = 30;
		const right = innerWidth - 30;
		switch (a?.kind) {
			case "purr":
				want = this.lieW > .5 ? "lie" : "sit";
				this.faceToward(0, .25);
				break;
			case "groom":
			case "wave":
			case "yawn":
			case "watch":
				want = "sit";
				if (a.kind === "wave") this.faceToward(0, .2);
				break;
			case "stretch": break;
			case "nap":
				want = "lie";
				break;
			case "roll":
				this.yawGoal = .25 * this.side;
				break;
			case "spin":
				this.yaw += dt * 7.5;
				this.yawGoal = this.yaw;
				if (done) {
					this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
					this.yawGoal = .3 * this.side;
				}
				break;
			case "pounce":
				want = "crouch";
				this.faceToward((a.x ?? this.x) - this.x, Math.PI / 2);
				if (done) {
					this.activity = null;
					this.lastPounce = this.t;
					this.leap(clamp(a.x ?? this.x, left, right), .1);
					return;
				}
				break;
			case "yarn": {
				const k = Math.min(1, a.t / 1.6);
				const from = a.x0 ?? this.x;
				const to = a.x ?? this.x;
				const yx = from + (to - from) * (1 - (1 - k) ** 2);
				W.placeYarn(a.el, yx, this.y, a.t * 540);
				targetX = yx - Math.sign(to - from) * this.h * .45;
				maxSpeed = 1.5 + .2 * this.playful;
				if (k >= 1 && Math.abs(this.x - targetX) < 8 && a.el.isConnected && !a.el.classList.contains("caught")) {
					const el = a.el;
					this.activity = null;
					this.leap(yx, .08);
					this.fx("✨", 2);
					el.classList.add("caught");
					this.trash.push({
						el,
						at: this.t + .45
					});
					W.yarnCaught(this);
					return;
				}
				if (a.el.classList.contains("caught")) this.activity = null;
				break;
			}
			case "flee":
				targetX = a.x ?? this.x;
				maxSpeed = 1.3;
				break;
			case "chaseCat": {
				const o = a.other;
				targetX = o.x - Math.sign(o.x - this.x) * this.h * .55;
				maxSpeed = 1.35;
				if (Math.abs(o.x - this.x) < this.h * .7 && a.t > .8) {
					this.activity = {
						kind: "spin",
						t: 0,
						dur: 1.2
					};
					o.activity = {
						kind: "spin",
						t: 0,
						dur: 1.2
					};
					this.flush = o.flush = 1;
					this.say("mya!");
					return;
				}
				break;
			}
			case "visit": {
				const o = a.other;
				if (o.jump) {
					this.activity = null;
					break;
				}
				targetX = o.x + Math.sign(this.x - o.x || 1) * this.h * .62;
				maxSpeed = .5;
				if (Math.abs(targetX - this.x) < 5) {
					this.activity = {
						kind: "allogroom",
						t: 0,
						dur: 3.2,
						other: o
					};
					o.beGroomed(3.4, this);
				}
				break;
			}
			case "allogroom":
				want = "sit";
				this.faceToward(a.other.x - this.x, .9);
				break;
			case "groomed":
				want = this.sleepy > .6 ? "lie" : "sit";
				this.faceToward(a.other.x - this.x, .35);
				break;
			case "wander":
				targetX = a.x ?? this.x;
				maxSpeed = .35;
				if (Math.abs(targetX - this.x) < 4) this.activity = null;
				break;
			default: {
				const p = W.pointer;
				if (W.followCursor && p && W.t - p.at < 3 && p.y > innerHeight * .45) {
					targetX = clamp(p.x + this.side * this.h * (.55 + .25 * W.indexOf(this)), left, right);
					maxSpeed = .5 + Math.min(1, Math.abs(targetX - this.x) / (this.h * 4));
					if (Math.abs(targetX - this.x) < this.h * .3) targetX = this.x;
				}
				if (this.stillFor > 1.2) want = "sit";
				if (this.stillFor > 2 && W.autonomy) this.idleThought(dt);
				this.maybePounce();
			}
		}
		if (done && this.activity === a) {
			this.activity = a.kind === "nap" ? {
				kind: "stretch",
				t: 0,
				dur: 1.4
			} : null;
			if (a.kind === "flee") this.say("mya~");
		}
		if (this.activity?.kind === "nap") {
			const p = W.pointer;
			if (p && W.t - p.at < .3 && Math.abs(p.x - this.x) < this.h * .6 && p.y > this.y - this.h * 1.2) this.activity = {
				kind: "stretch",
				t: 0,
				dur: 1.4
			};
		}
		if (want === "lie" && this.activity?.kind === "nap") {
			this.fxT -= dt;
			if (this.fxT <= 0) {
				this.fxT = 2.4;
				this.fx("z", 1);
			}
		}
		const dist = targetX - this.x;
		const goalSpeed = Math.abs(dist) < 1.5 ? 0 : Math.min(maxSpeed, Math.abs(dist) / W.ppm * 2.2 + .08);
		this.speed = damp(this.speed, goalSpeed, 6, dt);
		if (want !== "stand" && this.speed > .05) want = "stand";
		const step = Math.min(Math.abs(dist), this.speed * W.ppm * dt);
		this.x += Math.sign(dist) * step;
		this.phase += this.speed * dt / STRIDE * Math.PI * 2;
		if (this.speed > .04) {
			this.stillFor = 0;
			this.faceToward(dist, Math.PI / 2);
		} else {
			this.stillFor += dt;
			if (!this.activity) this.faceToward(innerWidth / 2 - this.x, .45);
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
	idleThought(dt) {
		this.nextIdle -= dt;
		if (this.nextIdle > 0) return;
		this.nextIdle = 7 + Math.random() * 12;
		const r = Math.random();
		const W = this.world;
		if (r < this.sleepy * .35) this.activity = {
			kind: "nap",
			t: 0,
			dur: 14 + Math.random() * 16
		};
		else if (r < .42) this.activity = {
			kind: "groom",
			t: 0,
			dur: 2.6
		};
		else if (r < .52) this.activity = {
			kind: "stretch",
			t: 0,
			dur: 1.4
		};
		else if (r < .6) this.activity = {
			kind: "yawn",
			t: 0,
			dur: 1.5
		};
		else if (r < .72) this.activity = {
			kind: "wander",
			t: 0,
			dur: 12,
			x: clamp(this.x + (Math.random() - .5) * innerWidth * .6, 40, innerWidth - 40)
		};
		else if (r < .82) W.startCuddle(this);
		else if (r < .82 + this.playful * .18 && !W.reducedMotion) W.startTag(this);
	}
	/** İmleç yerde, yakında kıpırdıyorsa: siner ve üstüne atlar. */
	maybePounce() {
		const W = this.world;
		const p = W.pointer;
		if (!p || W.t - p.at > .5 || this.t - this.lastPounce < 12 - 6 * this.playful || this.stillFor < .8) return;
		const h = this.h;
		const dx = p.x - this.x;
		if (Math.abs(dx) < h * .5 || Math.abs(dx) > h * 2.6 || p.y < this.y - h * 1.1 || p.y > this.y + 6) return;
		this.activity = {
			kind: "pounce",
			t: 0,
			dur: .9,
			x: p.x
		};
	}
	faceToward(dx, amount) {
		if (Math.abs(dx) > 1) this.yawGoal = Math.sign(dx) * amount;
	}
	leap(x1, h) {
		const dist = Math.abs(x1 - this.x) / this.world.ppm;
		this.jump = {
			x0: this.x,
			y0: this.y,
			x1,
			t: -.2,
			T: clamp(.35 + dist * .35, .35, .8),
			h
		};
		this.faceToward(x1 - this.x, Math.PI / 2);
		this.stillFor = 0;
		this.activity = null;
	}
	updateJump(dt, floor) {
		const j = this.jump;
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
		this.airW = damp(this.airW, k < .88 ? 1 : 0, 16, dt);
		this.crouchW = damp(this.crouchW, 0, 14, dt);
		if (k >= 1) {
			this.jump = null;
			this.y = floor;
			this.crouchW = .6;
		}
	}
	pose(dt) {
		const p = this.p;
		const a = this.activity?.kind;
		const W = this.world;
		p.t = this.t;
		p.phase = this.phase;
		const moving = this.speed > .04;
		p.walk = damp(p.walk, moving ? 1 : 0, 9, dt);
		p.run = damp(p.run, this.speed > .9 ? 1 : 0, 4, dt);
		p.sit = this.sitW;
		p.lie = this.lieW;
		p.crouch = this.crouchW;
		p.air = this.airW;
		if (!this.jump) this.airW = damp(this.airW, 0, 16, dt);
		p.groom = this.groomW;
		p.stretch = this.stretchW;
		p.knead = damp(p.knead, a === "purr" && this.playful > .5 ? 1 : 0, 5, dt);
		p.roll = this.rollW;
		p.rollSide = Math.sign(this.yawGoal || 1);
		p.wave = this.waveW;
		p.breathe = Math.sin(this.t * (this.lieW > .5 ? 1.6 : 2.6)) * .5 + .5;
		const happy = a === "purr" || a === "chaseCat" || a === "flee" || a === "groomed";
		p.tailUp = damp(p.tailUp, happy ? 1 : moving ? .5 : 0, 4, dt);
		p.tailSwish = damp(p.tailSwish, a === "pounce" ? .55 : this.lieW > .5 ? .05 : .25, 4, dt);
		p.tailSpeed = a === "pounce" ? 9 : a === "purr" ? 3 : 1.6;
		p.ears = damp(p.ears, a === "pounce" ? -.6 : 1, 6, dt);
		this.twitchT -= dt;
		if (this.twitchT <= 0) {
			this.twitchT = 2.5 + Math.random() * 5;
			p.earTwitch = 1;
		}
		p.earTwitch = Math.max(0, p.earTwitch - dt * 6);
		const ptr = W.pointer;
		const near = ptr && W.t - ptr.at < 2 && Math.abs(ptr.x - this.x) < this.h * 4;
		let lyaw = 0;
		let lpitch = .1;
		let ex = 0;
		let ey = .2;
		if (near && ptr) {
			const dx = ptr.x - this.x;
			const dy = this.y - this.h * .6 - ptr.y;
			lyaw = clamp(Math.sign(dx) * .6 - Math.sin(this.yaw) * .6, -.7, .7) * (Math.abs(dx) > 4 ? 1 : 0);
			lpitch = clamp(Math.atan2(dy, Math.abs(dx) + this.h) * .7, -.25, .35);
			ex = clamp(dx / (this.h * 2), -1, 1) * Math.cos(this.yaw);
			ey = clamp(dy / (this.h * 3), -.6, 1);
		}
		p.headYaw = damp(p.headYaw, lyaw * (1 - this.lieW) * (1 - this.groomW), 5, dt);
		p.headPitch = damp(p.headPitch, lpitch * (1 - this.lieW) * (1 - this.groomW), 5, dt);
		const lick = a === "allogroom" ? Math.sin(this.t * 9) * .08 : 0;
		p.headTilt = damp(p.headTilt, a === "purr" || a === "groomed" ? .22 : a === "watch" ? .15 : a === "allogroom" ? -.3 : 0, 4, dt);
		if (a === "allogroom") p.headPitch = damp(p.headPitch, -.25 + lick, 8, dt);
		if (a === "yawn") p.headPitch = damp(p.headPitch, .35, 6, dt);
		p.lookX = damp(p.lookX, ex, 8, dt);
		p.lookY = damp(p.lookY, ey, 8, dt);
		let eyes = "open";
		if (a === "purr" || a === "roll" || a === "groomed") eyes = "happy";
		else if (this.lieW > .5 || this.groomW > .5 || this.stretchW > .4 || a === "yawn" || a === "allogroom") eyes = "closed";
		else if (a === "pounce") eyes = "surprised";
		p.eyes = eyes;
		this.blinkT -= dt;
		if (this.blinkT <= 0) {
			this.blink = 1;
			this.blinkT = 2.5 + Math.random() * 3.5;
		}
		this.blink = Math.max(0, this.blink - dt * 7);
		p.eyeOpen = 1 - Math.sin(this.blink * Math.PI) * .95;
		const yawnO = a === "yawn" ? Math.sin(Math.min(1, this.activity.t / this.activity.dur) * Math.PI) : 0;
		p.mouthOpen = damp(p.mouthOpen, Math.max(this.stretchW > .3 ? 1 : 0, yawnO, a === "allogroom" ? .35 + lick * 3 : 0), 10, dt);
		this.flush = Math.max(0, this.flush - dt * .25);
		p.blush = Math.max(.35, this.flush);
		this.model.apply(p);
		this.yaw = damp(this.yaw, this.yawGoal, 7, dt);
		const root = this.model.root;
		root.rotation.y = this.yaw;
		root.scale.setScalar(1);
		W.toWorld(this.x, this.y, root.position);
	}
	/** Kedinin çevresini ortak çizicide çizer ve kendi tuvaline kopyalar. */
	render(renderer, camera, box) {
		const x = Math.round(this.x - box / 2);
		const y = Math.round(this.y - box * .72);
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
	fx(text, count) {
		for (let i = 0; i < count; i++) {
			const el = document.createElement("span");
			el.className = "fx";
			el.textContent = text;
			el.style.left = `${this.x + (Math.random() - .5) * this.h * .5}px`;
			el.style.top = `${this.y - this.h * .95}px`;
			el.style.animationDelay = `${i * .18}s`;
			this.world.root.appendChild(el);
			setTimeout(() => el.remove(), 1800 + i * 180);
		}
	}
	say(text) {
		const el = document.createElement("span");
		el.className = "say";
		el.textContent = text;
		el.style.left = `${this.x}px`;
		el.style.top = `${this.y - this.h * 1.1}px`;
		this.world.root.appendChild(el);
		setTimeout(() => el.remove(), 1600);
	}
};
/** Kediler: sahne, ortak çizici, imleç, kediler arası işler (kovalamaca, koklaşma, yumak). */
var Kediler = class {
	constructor(options = {}) {
		_defineProperty(this, "scene", new Scene());
		_defineProperty(this, "cats", []);
		_defineProperty(this, "root", void 0);
		_defineProperty(this, "host", void 0);
		_defineProperty(this, "pointer", null);
		_defineProperty(this, "t", 0);
		_defineProperty(this, "autonomy", void 0);
		_defineProperty(this, "followCursor", void 0);
		_defineProperty(this, "reducedMotion", matchMedia("(prefers-reduced-motion: reduce)").matches);
		_defineProperty(
			this,
			/** Kedi boyu (piksel). */
			"size",
			100
		);
		_defineProperty(
			this,
			/** Metre başına piksel (model ölçeğinde: kedinin boyu ~0,39 m). */
			"ppm",
			1
		);
		_defineProperty(this, "fixedSize", void 0);
		_defineProperty(this, "floorOffset", void 0);
		_defineProperty(this, "renderer", void 0);
		_defineProperty(this, "camera", new OrthographicCamera(-1, 1, 1, -1, .1, 100));
		_defineProperty(this, "box", 0);
		_defineProperty(this, "tagCooldown", 25);
		_defineProperty(this, "cuddleCooldown", 15);
		_defineProperty(this, "last", performance.now());
		_defineProperty(this, "raf", 0);
		_defineProperty(this, "stopped", false);
		_defineProperty(this, "software", softwareGL());
		_defineProperty(this, "off", []);
		_defineProperty(this, "loop", () => {
			if (this.stopped) return;
			this.raf = requestAnimationFrame(this.loop);
			if (document.hidden) return;
			const now = performance.now();
			const dt = Math.min(.1, (now - this.last) / 1e3);
			const calm = this.cats.every((c) => c.mood() === "sit" || c.mood() === "sleep");
			if (dt < (this.software ? 1 / 20 : calm ? 1 / 30 : 0) - .004) return;
			this.last = now;
			this.step(dt);
		});
		this.autonomy = options.autonomy ?? true;
		this.followCursor = options.followCursor ?? true;
		this.fixedSize = options.size ?? null;
		this.floorOffset = options.floorOffset ?? 0;
		this.host = document.createElement("web-kediler");
		this.host.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:${options.zIndex ?? 2147483e3};`;
		this.root = this.host.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = CSS;
		this.root.appendChild(style);
		document.body.appendChild(this.host);
		const key = new DirectionalLight(16777215, Math.PI * .85);
		key.position.set(-1, 2, 3);
		const amb = new AmbientLight(16777215, Math.PI * .12);
		key.layers.enableAll();
		amb.layers.enableAll();
		this.scene.add(key, amb);
		this.renderer = new WebGLRenderer({
			alpha: true,
			antialias: !this.software
		});
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.setPixelRatio(this.software ? 1 : Math.min(devicePixelRatio, 2));
		this.renderer.setClearColor(0, 0);
		this.camera.position.set(0, 0, 20);
		this.camera.lookAt(0, 0, 0);
		this.camera.layers.set(1);
		(options.cats ?? ["orange", "black"]).forEach((c, i) => this.cats.push(new Kedi(typeof c === "string" ? { color: c } : c, i, this)));
		this.resize();
		this.listen(window, "resize", () => this.resize());
		this.listen(window, "pointermove", (e) => {
			const ev = e;
			if (ev.pointerType === "mouse") this.pointer = {
				x: ev.clientX,
				y: ev.clientY,
				at: this.t
			};
		});
		this.listen(window, "pointerdown", (e) => {
			const ev = e;
			const cat = this.cats.find((k) => k.hitTest(ev.clientX, ev.clientY, ev.pointerType === "touch" ? 12 : 0));
			if (!cat) return;
			ev.preventDefault();
			ev.stopPropagation();
			cat.pet();
		}, { capture: true });
		this.listen(document, "visibilitychange", () => this.last = performance.now());
		this.loop();
	}
	listen(target, type, fn, opts = { passive: true }) {
		target.addEventListener(type, fn, opts);
		this.off.push(() => target.removeEventListener(type, fn, opts));
	}
	resize() {
		this.size = this.fixedSize ?? clamp(Math.min(innerHeight * .14, innerWidth * .2), 70, 120);
		this.ppm = this.size / ChibiCat.HEIGHT;
		const hw = innerWidth / 2 / this.ppm;
		const hh = innerHeight / 2 / this.ppm;
		Object.assign(this.camera, {
			left: -hw,
			right: hw,
			top: hh,
			bottom: -hh
		});
		this.camera.updateProjectionMatrix();
		this.box = Math.ceil(this.size * 2.2);
		this.renderer.setSize(this.box, this.box);
	}
	/** Zeminin ekran y'si (piksel). */
	floor() {
		return innerHeight - this.floorOffset;
	}
	toWorld(px, py, out) {
		return out.set((px - innerWidth / 2) / this.ppm, (innerHeight / 2 - py) / this.ppm, 0);
	}
	indexOf(cat) {
		return this.cats.indexOf(cat);
	}
	/** Zamanı elle ilerletir (test için). */
	step(dt) {
		this.t += dt;
		this.tagCooldown -= dt;
		this.cuddleCooldown -= dt;
		for (const c of this.cats) c.update(dt);
		for (const c of this.cats) c.render(this.renderer, this.camera, this.box);
	}
	/** İki kedi boştaysa: biri kaçar, öbürü kovalar. */
	startTag(cat) {
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
	startCuddle(cat) {
		if (this.cuddleCooldown > 0) return;
		const other = this.cats.find((o) => o !== cat && o.idle);
		if (!other) return;
		this.cuddleCooldown = 40 + Math.random() * 30;
		cat.visit(other);
	}
	/** Yere bir yumak atar; kediler kovalar, önce varan yakalar. `x` verilmezse kedilerin ortasından. */
	yarn(x) {
		const from = x ?? this.cats.reduce((s, c) => s + c.x, 0) / Math.max(1, this.cats.length);
		const to = clamp(from + (from < innerWidth / 2 ? 1 : -1) * innerWidth * .35, 40, innerWidth - 40);
		const el = document.createElement("span");
		el.className = "yarn";
		el.textContent = "🧶";
		this.root.appendChild(el);
		this.placeYarn(el, from, this.floor(), 0);
		for (const c of this.cats) c.chaseYarn(el, from, to);
	}
	placeYarn(el, x, top, deg) {
		el.style.transform = `translate(${x}px, ${top}px) translate(-50%, -100%) rotate(${deg}deg)`;
	}
	yarnCaught(winner) {
		for (const c of this.cats) if (c !== winner && c.mood() === "chase") c.lostYarn();
	}
	/** Bütün kediler pati sallar. */
	wave() {
		for (const c of this.cats) c.wave();
	}
	/** Kedileri kaldırır. */
	destroy() {
		this.stopped = true;
		cancelAnimationFrame(this.raf);
		for (const f of this.off) f();
		this.renderer.dispose();
		this.host.remove();
	}
};
// src/index.ts
/** Kedileri sayfaya koyar. `destroy()` ile kaldırılır. */
function start(options = {}) {
	return new Kediler(options);
}
export { BLACK_CAT, ChibiCat, GRAY_TABBY, Kedi, Kediler, ORANGE_TABBY, PALETTES, WHITE_CAT, restPose, start };
