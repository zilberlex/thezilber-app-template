import { createSmartHandler, KbKey, kbKeys, toArray } from '@svelte-ascend/core';
import type { ElementInteraction } from '../../types';

export function keyTriggerClick(
	interaction: ElementInteraction,
	hotkey: KbKey | KbKey[] = kbKeys(['enter', ' ']),
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
				const eventKey = KbKey.fromEvent(event);
				return asHotkeys.some((hk) => hk.matches(eventKey));
			},
			shouldPreventDefault: true
		}
	);
}
