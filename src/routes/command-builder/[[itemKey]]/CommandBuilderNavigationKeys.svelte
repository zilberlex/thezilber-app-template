<script lang="ts">
	import { browser } from '$app/environment';
	import { createKeyboardNavigationEventHandlerMixedSoftness } from '$lib/engine/hotkeys/bl-events';
	import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import type { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import { NAVIGATION_MANAGER_CONTEXT } from '$lib/engine/keyboard-navigation/svelte-components/consts';
	import { getContext, untrack } from 'svelte';

	let navigationManager = getContext<NavigationManager>(NAVIGATION_MANAGER_CONTEXT);

	let softNextScopeNavKeys = [hotkey(NavigationKeyConsts.ArrowRight)];
	let softPrevScopeNavKeys = [hotkey(NavigationKeyConsts.ArrowLeft)];
	let hardNextScopeNavKeys = [hotkey('tab')];
	let hardPrevScopeNavKeys = [hotkey('tab', 'shift')];

	let nextScopeNavigationKeys = [...softNextScopeNavKeys, ...hardNextScopeNavKeys];
	let prevScopeNavigationKeys = [...softPrevScopeNavKeys, ...hardPrevScopeNavKeys];

	function onScopeChangeKey(keyboardEvent: KeyboardEvent) {
		let eventHotkey = HotKey.fromEvent(keyboardEvent);

		const matchedSetIndex = eventHotkey.bestMatchingSetIndex([
			nextScopeNavigationKeys,
			prevScopeNavigationKeys
		]);

		if (matchedSetIndex === undefined) return;

		matchedSetIndex == 0 ? navigationManager.focusNextScope() : navigationManager.focusPrevScope();
	}

	$effect(() => {
		return untrack(() => {
			if (browser) {
				const softKeys = [...softNextScopeNavKeys, ...softPrevScopeNavKeys];
				const hardKeys = [...hardNextScopeNavKeys, ...hardPrevScopeNavKeys];
				const allKeys = [...softKeys, ...hardKeys];

				const onScopeChangeMixed = createKeyboardNavigationEventHandlerMixedSoftness(
					onScopeChangeKey,
					softKeys,
					hardKeys
				);

				hotKeysModule.assignHotKeys(allKeys, onScopeChangeMixed);

				return () => {
					hotKeysModule.removeHotKeys(allKeys, onScopeChangeMixed);
				};
			}
		});
	});
</script>
