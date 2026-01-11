import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { appState } from '../state/application-state.svelte';
import { HotKey } from './hotkey-class';

type EventHandler<E extends Event> = (event: E) => void;

class HotkeysModule {
	#wasInitialized = false;

	#hotKeysHandlers = new OneToManyDictionary<HotKey, EventHandler<KeyboardEvent>>(true);
	#hotKeysCaptureHandlers = new OneToManyDictionary<HotKey, EventHandler<KeyboardEvent>>(true);

	#onKeydownBound: (event: KeyboardEvent) => void = this.#onKeydown.bind(this);

	assignHotKey(key: HotKey, handler: EventHandler<KeyboardEvent>, isCaptrue = false) {
		console.debug('HotkeysModule assigning key:', key, 'to handler:', handler.toString());

		if (!this.#wasInitialized) {
			throw new Error(`${HotkeysModule.name} Need to initialize Class before assigning hotkeys`);
		}

		if (isCaptrue) {
			this.#hotKeysCaptureHandlers.add(key, handler);
		} else {
			this.#hotKeysHandlers.add(key, handler);
		}
	}

	removeHotKey(key: HotKey, handler: EventHandler<KeyboardEvent>) {
		this.#hotKeysHandlers.remove(key, handler);
		this.#hotKeysCaptureHandlers.remove(key, handler);
	}

	assignHotKeys(keys: HotKey[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.assignHotKey(key, handler));
	}

	removeHotKeys(keys: HotKey[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.removeHotKey(key, handler));
	}

	count = 0;
	#onKeydown(event: KeyboardEvent) {
		let hotKeyedHandlers = this.#hotKeysHandlers;

		if (event.eventPhase === Event.CAPTURING_PHASE) {
			hotKeyedHandlers = this.#hotKeysCaptureHandlers;
		}

		let eventKey = HotKey.fromEvent(event);
		let handlers = hotKeyedHandlers.get(eventKey);

		if (eventKey.key.toLowerCase() === 'escape') {
			console.log('phase', event.eventPhase, 'handlers', handlers);
		}

		console.debug(
			'HotkeysModule - reachedKeydownEvent key:',
			eventKey.toKey(),
			'relevantHandlers',
			handlers?.length
		);

		handlers?.forEach((handler) => handler(event));
	}

	init() {
		if (this.#wasInitialized) {
			throw new Error(`${HotkeysModule.name} Was already initialized`);
		}

		document.addEventListener('keydown', this.#onKeydownBound);
		document.addEventListener('keydown', this.#onKeydownBound, { capture: true });
		this.#wasInitialized = true;
	}

	destroy() {
		document.removeEventListener('keydown', this.#onKeydownBound);
		document.removeEventListener('keydown', this.#onKeydownBound, { capture: true });

		this.#hotKeysHandlers = new OneToManyDictionary();
		this.#wasInitialized = false;
	}
}

export const hotKeysModule = new HotkeysModule();
