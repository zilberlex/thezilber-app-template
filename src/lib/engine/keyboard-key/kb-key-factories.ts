import { KbKey } from './kb-key';
import type { KbKeyModifier } from './types';

export function kbKey(key: string, ...modifiers: KbKeyModifier[]) {
	return new KbKey(key, ...modifiers);
}

export function kbKeys(keys: string[], ...modifiers: KbKeyModifier[]) {
	return keys.map((key) => kbKey(key, ...modifiers));
}
