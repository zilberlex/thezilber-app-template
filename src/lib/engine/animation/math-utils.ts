export type NumberRange = number[];
export type RangeMaps = {fromRange: NumberRange, toRange: NumberRange}[];

export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}

export function remap(fromRange: NumberRange, toRange: NumberRange, value: number): number {
    const [f0, f1] = fromRange;
	const [t0, t1] = toRange;

	if (f1 === f0) return t0; // degenerate input range

	const t = (value - f0) / (f1 - f0);
	return t0 + t * (t1 - t0);
}

export function segmentedRemap(rangeMaps : RangeMaps, value: number): number {
    const targetMap = rangeMaps.find(rm => value >= rm.fromRange[0] && value <= rm.fromRange[1]);
    
    if (!targetMap) throw new Error(`Value [${value}] not found in range maps. ${JSON.stringify(rangeMaps)}`);

    return remap(targetMap.fromRange, targetMap.toRange, value);
}

export function floorTo(x: number, dp = 0): number {
	if (!Number.isFinite(x)) return x;
	const f = 10 ** dp;
	return Math.floor(x * f) / f;
}

export function cmpDigitAtPos(a: number, b: number, pos: number) {
    const aDigit = Math.floor(a / (10 ** pos));
    const bDigit = Math.floor(b / (10 ** pos));

    return aDigit - bDigit;
}

// counts fraction digits for a Number (e.g., 1e-6 -> 6, 123.45 -> 2)
export function countFractionDigits(x: number): number {
	if (!Number.isFinite(x)) return 0;
	if (Object.is(x, -0)) return 0;

	const s = x.toString().toLowerCase();
	if (!s.includes('e')) {
		const i = s.indexOf('.');
		return i === -1 ? 0 : s.length - i - 1;
	}

	// scientific notation: coeff * 10^exp
	const [coeff, expStr] = s.split('e');
	const exp = parseInt(expStr, 10);
	const dot = coeff.indexOf('.');
	const fracInCoeff = dot === -1 ? 0 : (coeff.length - dot - 1);

	return exp >= 0
		? Math.max(0, fracInCoeff - exp)
		: fracInCoeff + (-exp);
}

export function indexOfMsdDiff(a: number, b: number): number {
	if (a === b) return -1;
	const sa = a.toString();
	const sb = b.toString();
	const n = Math.max(sa.length, sb.length);
	const pa = sa.padStart(n, '0');
	const pb = sb.padStart(n, '0');

	for (let i = 0; i < n; i++) {
		if (pa[i] !== pb[i]) return (n - 1) - i; // flip to LSD-based index
	}
	
	return -1;
}
