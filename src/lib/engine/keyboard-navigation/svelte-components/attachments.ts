import type { Attachment } from 'svelte/attachments';
import { NAVIGATION_TARGET_ATTRIBUTE, NAVIGATION_TARGET_ID_ATTRIBUTE } from '../consts';
import type { NavigationTargetId } from '../types';
import { engineAssert } from '$lib/engine/error/engine-assert';

export function markForNavigation(id?: NavigationTargetId): Attachment {
	return (element) => {
		engineAssert(id !== '', 'Navigation target ID cannot be empty.');

		element.setAttribute(NAVIGATION_TARGET_ATTRIBUTE, '');

		if (id !== undefined) {
			element.setAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE, id);
		}
	};
}
