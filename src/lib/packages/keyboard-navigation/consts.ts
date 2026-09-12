export const NAVIGATION_TARGET_ATTRIBUTE = 'data-navigation-target';
export const NAVIGATION_SCOPE_ATTRIBUTE = 'data-navigation-scope';

export const NAVIGATION_TARGET_ID_ATTRIBUTE = 'data-navigation-target-id';
export const NAVIGATION_RESOLVED_TARGET_ID_ATTRIBUTE = 'data-navigation-target-id-resolved';

export enum NavigationKeyConsts {
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown'
}

export const ArrowKeysArray: string[] = [
	NavigationKeyConsts.ArrowDown,
	NavigationKeyConsts.ArrowUp,
	NavigationKeyConsts.ArrowLeft,
	NavigationKeyConsts.ArrowRight
];
