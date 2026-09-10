export type HotKeyModifier = 'ctrl|option' | 'shift' | 'alt';

type HotKeyToTriggerOptions = {
	prioritizeInputFieldDefaults?: boolean;
};

type HotKeyToTriggerClickOptions = HotKeyToTriggerOptions & {
	moveFocus?: boolean;
};
