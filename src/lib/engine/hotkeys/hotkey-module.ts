import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';
import { HotKey } from './hotkey-class';

type EventHandler<E extends Event> = (event: E) => void;

class HotkeysModule {
	#wasInitialized = false;

	#hotKeysToHandlers = new OneToManyDictionary<HotKey, EventHandler<KeyboardEvent>>(true);

	#onKeydownBound: (event: KeyboardEvent) => void = this.#onKeydown.bind(this);

	assignHotKey(key: HotKey, handler: EventHandler<KeyboardEvent>) {
		console.debug('HotkeysModule assigning key:', key, 'to handler:', handler.toString());

		if (!this.#wasInitialized) {
			throw new Error(`${HotkeysModule.name} Need to initialize Class before assigning hotkeys`);
		}

		this.#hotKeysToHandlers.add(key, handler);
	}

	removeHotKey(key: HotKey, handler: EventHandler<KeyboardEvent>) {
		this.#hotKeysToHandlers.remove(key, handler);
	}

	assignHotKeys(keys: HotKey[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.assignHotKey(key, handler));
	}

	removeHotKeys(keys: HotKey[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.removeHotKey(key, handler));
	}

	#onKeydown(event: KeyboardEvent) {
		let hotKeyedHandlers = this.#hotKeysToHandlers;
		let eventKey = HotKey.fromEvent(event);
		let handlers = hotKeyedHandlers.get(eventKey);

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
		this.#wasInitialized = true;
	}

	destroy() {
		document.removeEventListener('keydown', this.#onKeydownBound);

		this.#hotKeysToHandlers = new OneToManyDictionary();
		this.#wasInitialized = false;
	}
}

export const hotKeysModule = new HotkeysModule();
