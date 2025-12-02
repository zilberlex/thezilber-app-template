import { lerp } from '$lib/my-packages/custom-svelte-transitions/math-utils';

export function count(
	node: Element,
	{ delay = 0, duration = 2000, from = 0, to = 1000, tween = (t: number) => lerp(from, to, t) }
) {
	return {
		delay,
		duration,
		tick: (t: number) => {
			const val = tween(t);
			node.innerHTML = Math.floor(val).toString();
		}
	};
}
