import { createSmartHandler } from '$lib/engine/events/event-handling';
import { toArray } from '$lib/engine/general-js-ts/to-array';
import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
import { hotkey, hotkeys } from '$lib/engine/hotkeys/hotkey-helpers';
import type { ElementInteraction } from '../../types';

// export function createKeyboardClickHandler(
// 	interaction: ElementInteraction,
// 	options?: {
// 		cooldownMs?: number;
// 	}
// ) {
// 	return createSmartHandler(
// 		(event: KeyboardEvent) => {
// 			interaction.click(event.currentTarget as HTMLElement);
// 		},
// 		{
// 			cooldownDelay: options?.cooldownMs ?? 0,
// 			shouldExecuteFunction: isKeyboardGoEvent,
// 			shouldPreventDefault: true
// 		}
// 	);
// }
//
//
//

export function keyTriggerClick(
	interaction: ElementInteraction,
	hotkey: HotKey | HotKey[] = hotkeys(['enter', ' ']),
	options = {
		cooldownMs: 20
	}
) {
	const { cooldownMs } = options;

	const asHotkeys = toArray(hotkey);

	return createSmartHandler(
		(event: KeyboardEvent) => {
			const target = event.target as HTMLButtonElement;
			interaction.click(target);
		},
		{
			cooldownDelay: cooldownMs,
			shouldExecuteFunction: (event: KeyboardEvent) => {
				const eventKey = HotKey.fromEvent(event);
				return asHotkeys.some((hk) => hk.matches(eventKey));
			},
			shouldPreventDefault: true
		}
	);
}
