import { sleep } from '../general-js-ts/common';

export function temporaryAnimationClass(classTimeMs: number) {
	let active = $state(false);
	let opId = 0;

	async function activate() {
		active = true;

		const id = ++opId;

		await sleep(classTimeMs);

		if (id !== opId) {
			return;
		}

		active = false;
	}

	return {
		get active() {
			return active;
		},
		activate
	};
}
