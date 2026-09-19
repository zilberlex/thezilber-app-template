export { HotkeyManager, hotKeysModule } from './hotkey-manager';

export {
	createHotKeyHandler,
	createHotKeyTriggerClickHandler,
	createHotKeyTriggerFocusHandler,
	shouldExecuteHotKeyHandler
} from './hotkey-handlers';

export type { HotKeyToTriggerOptions, HotKeyToTriggerClickOptions } from './types';
