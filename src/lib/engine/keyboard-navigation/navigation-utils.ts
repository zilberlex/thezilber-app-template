import { navigationStateManager } from '$lib/engine/state/navigation-state';

export function keyBoardFocusNavigatedNode(node: HTMLElement) {
	navigationStateManager.setKeyboardNavigationMode();
	node.focus({ preventScroll: true });
	node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function getFocusableElementsByNode(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(
		node.querySelectorAll('a, button, input, textarea, select, details, [tabindex]')
	).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}
