export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}

export function floorTo(x: number, dp = 0): number {
	if (!Number.isFinite(x)) return x;
	const f = 10 ** dp;
	return Math.floor(x * f) / f;
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
