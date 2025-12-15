import { OneToManyDictionary } from '$lib/engine/patterns/one-to-many-dictionary';

type EventHandler<E extends Event> = (event: E) => void;
type HotKeyModifiers = ('ctrlKey' | 'shiftKey' | 'altKey')[];
type HotKeyOptions<E extends Event> = {
	handler: EventHandler<E>;
	modifiers?: HotKeyModifiers;
};

class HotkeysModule {
	#wasInitialized = false;

	#hotKeysToHandlers = new OneToManyDictionary<string, HotKeyOptions<KeyboardEvent>>(true);

	#onKeydownBound: (event: KeyboardEvent) => void = this.#onKeydown.bind(this);

	assignHotKeys(keys: string[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.assignHotKey(key, handler));
	}

	assignHotKey(key: string, handler: EventHandler<KeyboardEvent>, modifiers?: HotKeyModifiers) {
		console.debug('HotkeysModule assigning key:', key, 'to handler:', handler.toString());
		key = key.toLowerCase();

		if (!this.#wasInitialized) {
			throw new Error(`${HotkeysModule.name} Need to initialize Class before assigning hotkeys`);
		}

		this.#hotKeysToHandlers.add(key, { handler, modifiers });
	}

	removeHotKey(key: string, handler: EventHandler<KeyboardEvent>) {
		this.#hotKeysToHandlers.remove(key, { handler });
	}

	removeHotKeys(keys: string[], handler: EventHandler<KeyboardEvent>) {
		keys.forEach((key) => this.removeHotKey(key, handler));
	}

	#onKeydown(event: KeyboardEvent) {
		let eventKey = event.key.toLowerCase();

		let hotKeyedHandlers = this.#hotKeysToHandlers;

		let hotKeyInfo = hotKeyedHandlers.get(eventKey);

		console.debug(
			'HotkeysModule - reachedKeydownEvent key:',
			eventKey,
			'relevantHandlers',
			hotKeyInfo?.length
		);

		hotKeyInfo?.forEach((info) => info.handler(event));
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
