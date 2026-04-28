import { HotKey } from './hotkey-class';
import type { HotKeyModifier } from './types';

export function hotkey(key: string, ...modifiers: HotKeyModifier[]) {
	return new HotKey(key, ...modifiers);
}

export function hotkeys(keys: string[], ...modifiers: HotKeyModifier[]) {
	return keys.map((key) => hotkey(key, ...modifiers));
}
