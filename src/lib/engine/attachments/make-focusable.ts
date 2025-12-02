import type { Attachment } from 'svelte/attachments';

export function makeFocusable(params: { isMobile: boolean }): Attachment {
	return (node) => {
		if (!params.isMobile) {
			node.classList.add('focusable');
			node.setAttribute('tabindex', '0');
		} else {
			node.classList.remove('focusable');
			node.removeAttribute('tabindex');
		}
	};
}
