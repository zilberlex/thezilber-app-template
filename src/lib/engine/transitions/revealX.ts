export function revealX(node: Element, { duration = 150, easing = (t: number) => t } = {}) {
	const opacity = +getComputedStyle(node).opacity;

	return {
		duration,
		easing,
		css: (t: number) => `
			overflow: clip;
			opacity: ${Math.min(t * 3, 1) * opacity};
			clip-path: inset(0 ${100 - t * 100}% 0 0);
		`
	};
}
