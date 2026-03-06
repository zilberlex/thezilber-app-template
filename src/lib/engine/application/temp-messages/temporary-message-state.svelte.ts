import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { AutoResetValue } from '$lib/ui/reactive-classes/autoResetValue.svelte';

class TemporaryMessageState {
	#message: string = $state('');
	#counter = $state(0);
	#isShowing = new AutoResetValue(false, 2000);

	messageTimeoutMs = 10000;

	get message() {
		track(this.#counter);
		return this.#message;
	}

	get isShowing() {
		track(this.#counter);
		return this.#isShowing.value;
	}

	set message(v: string) {
		this.setMessageWithTimout(v);
	}

	setMessageWithTimout(v: string, timeoutMs?: number) {
		this.#counter++;
		this.#message = v;
		this.#isShowing.setWithTimeout(true, timeoutMs ?? this.messageTimeoutMs);
	}
}

export const temporaryMessageState = new TemporaryMessageState();
