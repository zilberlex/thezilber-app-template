export const NodesWhichTakePriorityOverSoftHotKeys = ['input', 'select', 'summary', 'textarea'];
export type HotKeyModifier = 'ctrl|option' | 'shift' | 'alt';

export type NavType = {
	direction: 'hor-prev' | 'hor-next' | 'ver-prev' | 'ver-next' | undefined;
	strength: 'soft' | 'hard';
	isArrow: boolean;
};

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
