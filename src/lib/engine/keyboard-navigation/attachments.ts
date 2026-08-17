import { NAVIGATION_TARGET_ATTRIBUTE } from './consts';

export function markForNavigation(e: HTMLElement) {
	e.setAttribute(NAVIGATION_TARGET_ATTRIBUTE, '');
}
