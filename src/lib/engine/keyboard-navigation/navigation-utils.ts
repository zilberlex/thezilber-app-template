import { navigationStateManager } from '../state/navigation-state.svelte';
import { safeInstanceOf } from '../types/type-utils';
import type { FocusableElement } from './types';

export function engineFocus(node: FocusableElement) {
	node.focus({ preventScroll: true });
	node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

	const textElement = safeInstanceOf(node, HTMLInputElement, HTMLTextAreaElement);
	textElement?.select();
}

export function keyBoardFocusNavigatedNode(node: FocusableElement) {
	navigationStateManager.setKeyboardNavigationMode();

	engineFocus(node);
}

export function getFocusableElementsByNode(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(
		node.querySelectorAll('a, button, input, textarea, select, summary, [tabindex]')
	).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}
