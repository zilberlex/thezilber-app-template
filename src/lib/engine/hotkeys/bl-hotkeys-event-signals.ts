import { DispatcherImpl } from '$lib/engine/patterns/observer';

export interface NavigationHotkeyEventObject {
	targetNode: HTMLElement;
	key: string;
}

export interface ClickHotkeyEventObject {
	targetNode: HTMLElement | null;
	key: string;
}

export interface FocusHotkeyEventObject {
	targetNode: HTMLElement | null;
	key: string;
}

export interface MarkParagraphEventObject {
	targetNode: HTMLElement;
	wasMarked: boolean;
}

const navigationHotkeyEventDispatcher = new DispatcherImpl<NavigationHotkeyEventObject>();
const clickHotkeyEventDispatcher = new DispatcherImpl<ClickHotkeyEventObject>();
const focusHotkeyEventDispatcher = new DispatcherImpl<ClickHotkeyEventObject>();
const markParagraphEventDispatcher = new DispatcherImpl<MarkParagraphEventObject>();

type BLEventsHandler<T> = (obj: T) => any | boolean;
type UnregisterFunction = () => any;
type RegisterFunction<T> = (
	handlerWithCheckForAutoRemoval: BLEventsHandler<T>
) => UnregisterFunction;

export function registerNavigationHotkeyHandler(
	handler: (obj: NavigationHotkeyEventObject) => any | boolean
): UnregisterFunction {
	navigationHotkeyEventDispatcher.register(handler);

	return () => navigationHotkeyEventDispatcher.unregister(handler);
}

export function signalNavigationHotkeyEvent(key: string, targetNode: HTMLElement) {
	navigationHotkeyEventDispatcher.signal({ key, targetNode });
}

export function registerClickHotkeyHandler(
	handler: BLEventsHandler<ClickHotkeyEventObject>
): UnregisterFunction {
	clickHotkeyEventDispatcher.register(handler);

	return () => clickHotkeyEventDispatcher.unregister(handler);
}

export function signalClickHotkeyEvent(key: string, targetNode: HTMLElement | null) {
	clickHotkeyEventDispatcher.signal({ key, targetNode });
}

export function registerFocusHotkeyHandler(handler: (obj: FocusHotkeyEventObject) => void) {
	focusHotkeyEventDispatcher.register(handler);

	return () => focusHotkeyEventDispatcher.unregister(handler);
}

export function signalFocusHotkeyEvent(key: string, targetNode: HTMLElement | null) {
	focusHotkeyEventDispatcher.signal({ key, targetNode });
}

export function registerMarkParagraphHandler(handler: (obj: MarkParagraphEventObject) => void) {
	markParagraphEventDispatcher.register(handler);

	return () => markParagraphEventDispatcher.unregister(handler);
}

export function signalMarkParagraphEvent(wasMarked: boolean, targetNode: HTMLElement) {
	markParagraphEventDispatcher.signal({ wasMarked, targetNode });
}

export function registerAutoDeregisteringHandlerHelper<T>(
	registerFunction: (callback: (obj: T) => void) => () => any,
	handler: (obj: T) => boolean
) {
	let unregisterFunc: (() => any) | null = null;
	let autoUnregisterHandler = (obj: T) => {
		if (handler(obj) && unregisterFunc) {
			unregisterFunc();
			unregisterFunc = null;
		}
	};

	unregisterFunc = registerFunction(autoUnregisterHandler);
}
