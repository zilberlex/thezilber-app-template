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

const focusableCandidateSelector = [
	'a[href]',
	'button',
	'input',
	'select',
	'textarea',
	'details > summary:first-of-type',
	'[tabindex]',
	'[contenteditable="true"]'
].join(',');

function isCandidateFocusable(el: HTMLElement): boolean {
	if (el.matches('[disabled]')) return false;
	if (el.matches('[tabindex="-1"]')) return false;
	if (el.closest('[inert]')) return false;

	return true;
}

export function getFocusableElementsByNode(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(node.querySelectorAll(focusableCandidateSelector)).filter(isCandidateFocusable);
}

export function getFirstFocusable(node: HTMLElement) {
	if (node.matches(focusableCandidateSelector) && isCandidateFocusable(node)) {
		return node;
	}

	let candidate = node.querySelector(focusableCandidateSelector) as HTMLElement;
	if (candidate && isCandidateFocusable(candidate)) {
		return candidate;
	}
	return null;
}
