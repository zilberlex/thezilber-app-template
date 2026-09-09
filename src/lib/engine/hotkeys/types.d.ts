export type HotKeyModifier = 'ctrl|option' | 'shift' | 'alt';

export type NavType = {
	direction: 'hor-prev' | 'hor-next' | 'ver-prev' | 'ver-next' | undefined;
	strength: 'soft' | 'hard';
	isArrow: boolean;
};

type ButtonHotKeyOptions = {
	prioritizeInputFieldDefaults?: boolean;
	moveFocus?: boolean;
};
