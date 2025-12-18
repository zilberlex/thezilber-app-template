import { navigationStateManager } from '$lib/engine/state/navigation-state';

export function keyBoardFocusNavigatedNode(node: HTMLElement) {
	navigationStateManager.setKeyboardNavigationMode();
	node.focus({ preventScroll: true });
	node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

	const textElement = node as HTMLInputElement | HTMLTextAreaElement | null;
	if (textElement) textElement.select();
}

export function getFocusableElementsByNode(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(
		node.querySelectorAll('a, button, input, textarea, select, summary, [tabindex]')
	).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}
