import { KbKey, OneToManyDictionary } from '@svelte-ascend/core';

type EventHandler<E extends Event> = (event: E) => void;

export class HotkeyManager {
	#isInitialized = false;

	#hotKeysHandlers = new OneToManyDictionary<KbKey, EventHandler<KeyboardEvent>>(true);
	#hotKeysCaptureHandlers = new OneToManyDictionary<KbKey, EventHandler<KeyboardEvent>>(true);

	#onKeydownBound: (event: KeyboardEvent) => void = this.#onKeydown.bind(this);

	assignHotKey(key: KbKey, handler: EventHandler<KeyboardEvent>, isCapture = false) {
		console.debug('HotkeysModule assigning key:', key, 'to handler:', handler.name ?? '<anonymous>');

		if (!this.#isInitialized) {
			throw new Error(`${HotkeyManager.name} Need to initialize Class before assigning hotkeys`);
		}

		if (isCapture) {
			this.#hotKeysCaptureHandlers.add(key, handler);
		} else {
			this.#hotKeysHandlers.add(key, handler);
		}
	}

	removeHotKey(key: KbKey, handler: EventHandler<KeyboardEvent>) {
		console.debug('HotkeysModule removing key:', key, 'to handler:', handler.name ?? '<anonymous>');
		this.#hotKeysHandlers.remove(key, handler);
		this.#hotKeysCaptureHandlers.remove(key, handler);
	}

	assignHotKeys(keys: KbKey[], handler: EventHandler<KeyboardEvent>, isCapture = false) {
		keys.forEach((key) => this.assignHotKey(key, handler, isCapture));
	}

	removeHotKeys(keys: KbKey[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.removeHotKey(key, handler));
	}

	get isInitialized() {
		return this.#isInitialized;
	}

	#onKeydown(event: KeyboardEvent) {
		let hotKeyedHandlers = this.#hotKeysHandlers;

		if (event.eventPhase === Event.CAPTURING_PHASE) {
			hotKeyedHandlers = this.#hotKeysCaptureHandlers;
		}

		const eventKey = KbKey.fromEvent(event);
		const possibleMatches = eventKey.getPossibleRegisteredMatches();

		const matches = hotKeyedHandlers.getMultiple(possibleMatches);

		const handlers = eventKey.pickBestMatch(
			matches.map(({ key, values }) => ({
				kbKey: key,
				cbObject: values
			}))
		);

		console.debug('HotkeysModule - reachedKeydownEvent key:', eventKey.toKey(), 'relevantHandlers', handlers?.length);

		// Fires Last Handler - Hopefully this is good enough for most cases.
		handlers?.at(-1)?.(event);
	}

	init() {
		console.log('Initialize HotkeyManager', {
			manager: this
		});

		if (this.#isInitialized) {
			throw new Error(`${HotkeyManager.name} Was already initialized`);
		}

		document.addEventListener('keydown', this.#onKeydownBound);
		document.addEventListener('keydown', this.#onKeydownBound, { capture: true });
		this.#isInitialized = true;
	}

	destroy() {
		console.log('Destroy HotkeyManager', {
			manager: this
		});

		document.removeEventListener('keydown', this.#onKeydownBound);
		document.removeEventListener('keydown', this.#onKeydownBound, { capture: true });

		this.#hotKeysHandlers = new OneToManyDictionary(true);
		this.#hotKeysCaptureHandlers = new OneToManyDictionary(true);
		this.#isInitialized = false;
	}
}

export const hotKeysModule = new HotkeyManager();
