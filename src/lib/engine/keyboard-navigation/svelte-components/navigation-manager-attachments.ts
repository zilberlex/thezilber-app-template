import type { Attachment } from 'svelte/attachments';
import type { NavigationScopeContext } from './types';

export function navigationScopeObserver(
	context: NavigationScopeContext,
	options: MutationObserverInit = { childList: true }
): Attachment<HTMLElement> {
	return (element) => {
		context.scope?.observeMutations(element, options);
	};
}
