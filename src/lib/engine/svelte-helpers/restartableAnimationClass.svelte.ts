// restartClassAnimation.svelte.ts
import { nextFrame } from '$lib/engine/general-js-ts/nextFrame';

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
