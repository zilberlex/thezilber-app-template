// restartClassAnimation.svelte.ts
import { nextFrame } from '$lib/packages/core/general-js-ts/next-frame';

export function restartableAnimationClass() {
	let active = $state(false);
	let opId = 0;

	async function restartClass() {
		active = false;

		const id = ++opId;

		await nextFrame();

		if (id !== opId) {
			return;
		}

		active = true;
	}

	function deactivateClass() {
		opId++;
		active = false;
	}

	return {
		get active() {
			return active;
		},
		restartClass,
		deactivateClass
	};
}
