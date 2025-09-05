// raf-safe.ts
export type RafHandle = number | ReturnType<typeof setTimeout>;
export type Raf = (cb: (ts: number) => void) => RafHandle;
export type Caf = (h: RafHandle) => void;

const g: any = globalThis as any;
const now = () => (g.performance?.now ? g.performance.now() : Date.now());

let last = 0;
const fallbackRaf: Raf = (cb) => {
	const t = now();
	const dt = t - last;
	const delay = Math.max(0, 16 - dt); // ~60Hz
	const id = setTimeout(() => {
		last = now();
		cb(last); // rAF-like high-res timestamp
	}, delay);
	return id;
};

const fallbackCaf: Caf = (h) => clearTimeout(h as ReturnType<typeof setTimeout>);

export const safeRaf: Raf =
	typeof g.requestAnimationFrame === 'function'
		? g.requestAnimationFrame
		: fallbackRaf;

export const safeCaf: Caf =
	typeof g.cancelAnimationFrame === 'function'
		? g.cancelAnimationFrame
		: fallbackCaf;
