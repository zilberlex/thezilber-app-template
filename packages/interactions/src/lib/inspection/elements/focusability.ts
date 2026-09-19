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

export function isFocusable(element: HTMLElement): boolean {
	return element.matches(focusableCandidateSelector) && isCandidateFocusable(element);
}

export function getFocusable(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(node.querySelectorAll(focusableCandidateSelector)).filter(isCandidateFocusable);
}

export function getFirstFocusable(node: HTMLElement): HTMLElement | null {
	if (isFocusable(node)) {
		return node;
	}

	for (const candidate of node.querySelectorAll<HTMLElement>(focusableCandidateSelector)) {
		if (isCandidateFocusable(candidate)) {
			return candidate;
		}
	}

	return null;
}
