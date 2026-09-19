import type { KeyboardEventHandler } from 'svelte/elements';
import { ArrowKeysArray, NavigationKeyConsts } from './consts';
import type { NavType } from './types';
import { createHotKeyHandler } from '@svelte-ascend/hotkey-module';

export function createKeyabordNavigationEventHandler(handler: KeyboardEventHandler<any>) {
	return createHotKeyHandler(handler);
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

	const isArrow = ArrowKeysArray.includes(key);

	return {
		direction,
		isArrow
	};
}
