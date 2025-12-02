import { navigationStateManager } from '$lib/engine/state/navigation-state';
import {
	ArrowKeysArray,
	NavigationKeyConsts,
	NodesWhichDontNavigateWithArrowKeys,
	type NavType
} from './types';

export function keyBoardFocusNavigatedNode(node: HTMLElement) {
	navigationStateManager.setKeyboardNavigationMode();
	node.focus({ preventScroll: true });
	node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function getFocusableElementsByNode(node: HTMLElement): HTMLElement[] {
	return Array.from<HTMLElement>(
		node.querySelectorAll('a, button, input, textarea, select, summary, [tabindex]')
	).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}

export function shouldIgnoreNavigation(event: KeyboardEvent) {
	let element = event.target as HTMLElement;
	let navType = GetNavType(event);
	return (
		navType.isArrow &&
		navType.strength === 'soft' &&
		NodesWhichDontNavigateWithArrowKeys.includes(element.tagName.toLowerCase())
	);
}

export function GetNavType(event: KeyboardEvent): NavType {
	const key = event.key;

	const direction =
		key === NavigationKeyConsts.ArrowLeft
			? 'hor-prev'
			: key === NavigationKeyConsts.ArrowRight
				? 'hor-next'
				: key === NavigationKeyConsts.ArrowUp
					? 'ver-prev'
					: key === NavigationKeyConsts.ArrowDown
						? 'ver-next'
						: undefined;

	const strength = event.ctrlKey ? 'hard' : 'soft';

	const isArrow = ArrowKeysArray.includes(key);

	return {
		direction,
		strength,
		isArrow
	};
}
