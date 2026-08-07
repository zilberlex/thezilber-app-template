<script lang="ts">
	import { fade } from 'svelte/transition';
	import { type DialogController } from './dialog-context.svelte';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import { engineFocus, getFocusableElementsByNode } from '$lib/engine/keyboard-navigation/navigation-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onNavigate } from '$app/navigation';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import type { FocusableElement } from '$lib/engine/keyboard-navigation/types';
	import { safeInstanceOf } from '$lib/engine/types/type-utils';

	let dialogBoxNode: HTMLElement | null = $state(null);
	let appRoot = $derived(appState.appRoot);

	let { dialogController }: { dialogController: DialogController } = $props();

	let lastFocusedElement: FocusableElement | null = null;

	let focusOpenDialogJobCounter = 0;

	onDestroy(() => {
		cleanupComponent();
		hotKeysModule.removeHotKey(new HotKey('Escape'), closeDialogHandler);
	});

	onNavigate(() => {
		cleanupComponent();
	});

	onMount(() => {
		hotKeysModule.assignHotKey(new HotKey('Escape'), closeDialogHandler, true);
	});

	const closeDialogHandler = createSmartHandler(
		() => {
			dialogController.closeAllActiveDialogs();
		},
		{ cooldownDelay: 20 }
	);

	function cleanupComponent() {
		dialogController.closeAllActiveDialogs();
		dialogCloseCleanup();
	}

	function dialogCloseCleanup() {
		focusOpenDialogJobCounter++;
		if (appRoot) {
			appRoot.inert = false;
		}

		if (lastFocusedElement && document.contains(lastFocusedElement)) engineFocus(lastFocusedElement);
	}

	$effect(() => {
		if (!appRoot) return;

		if (dialogController.isOpen) {
			const thisJob = ++focusOpenDialogJobCounter;
			const activeElement = document.activeElement;
			lastFocusedElement = safeInstanceOf(activeElement);
			appRoot.inert = true;

			tick().then(() => {
				// This is async so the dialog box get mounted before an element inside receives focus
				if (thisJob !== focusOpenDialogJobCounter) return;

				untrack(() => {
					if (dialogBoxNode) {
						const focableNodes = getFocusableElementsByNode(dialogBoxNode);

						let focusTarget = dialogBoxNode;
						if (focableNodes.length > 0) {
							focusTarget = focableNodes[0];
						}

						engineFocus(focusTarget);
					}
				});
			});
		} else {
			dialogCloseCleanup();
		}
	});
</script>

{#if dialogController.isOpen && dialogController.activeElementRender}
	<div
		class="dialog-anchor"
		onpointerdown={(e) => {
			if (e.currentTarget === e.target) dialogController.closeAllActiveDialogs();
		}}
		transition:fade={{ duration: 200 }}
	>
		<div bind:this={dialogBoxNode} aria-modal="true" class="dialog-box" role="dialog" tabindex="-1">
			{@render dialogController.activeElementRender()}
		</div>
	</div>
{/if}

<style>
	.dialog-anchor {
		position: fixed;
		inset: 0;
		backdrop-filter: blur(2px) grayscale(0.5);
		background-color: rgb(0 0 0 / 0.5);
		pointer-events: auto;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dialog-box {
		outline: none;

		animation: focus-ring-in 500ms ease-out 0ms 1 forwards;
	}
</style>
