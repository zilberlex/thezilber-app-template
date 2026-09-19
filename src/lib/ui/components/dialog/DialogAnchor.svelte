<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onNavigate } from '$app/navigation';
	import { createSmartHandler } from '@svelte-ascend/core';
	import { hotKeysModule } from '$lib/packages/hotkey-module';
	import type { FocusableElement } from '$lib/packages/interactions';
	import { safeInstanceOf } from '$lib/engine/types/type-utils';
	import { track } from '$lib/packages/core/svelte';
	import { NavigationScope } from '$lib/packages/keyboard-navigation/svelte';
	import type { DialogController } from './dialog-contoller.svelte';
	import { getFocusable } from '$lib/packages/interactions';
	import { engineElementInteraction } from '$lib/engine/engine-hotkeys/engine-interactions';
	import { kbKey } from '@svelte-ascend/core';

	let dialogBoxNode: HTMLElement | null = $state(null);
	let appRoot = $derived(appState.appRoot);

	const propsId = $props.id();
	let dialogAnchorId = `dialog-anchor-${propsId}`;

	let { dialogController }: { dialogController: DialogController } = $props();

	let lastFocusedElement: FocusableElement | null = null;

	let focusOpenDialogJobCounter = 0;

	onDestroy(() => {
		cleanupComponent();
		hotKeysModule.removeHotKey(kbKey('Escape'), closeDialogHandler);
	});

	onNavigate(() => {
		cleanupComponent();
	});

	onMount(() => {});

	const closeDialogHandler = createSmartHandler(
		() => {
			dialogController.closeAllDialogs();
		},
		{ cooldownDelay: 20 }
	);

	function cleanupComponent() {
		dialogController.closeAllDialogs();
		dialogCloseCleanup();
	}

	function dialogCloseCleanup() {
		focusOpenDialogJobCounter++;
		if (appRoot) {
			appRoot.inert = false;
		}

		if (lastFocusedElement && document.contains(lastFocusedElement)) engineElementInteraction.focus(lastFocusedElement);
	}

	$effect(() => {
		track(dialogController);

		return untrack(() => {
			if (dialogController.activeDialog) {
				hotKeysModule.assignHotKey(kbKey('Escape'), closeDialogHandler, true);

				if (dialogController.activeDialog) {
					const thisJob = ++focusOpenDialogJobCounter;
					const activeElement = document.activeElement;
					lastFocusedElement = safeInstanceOf(activeElement);

					tick().then(() => {
						// This is async so the dialog box get mounted before an element inside receives focus
						if (thisJob !== focusOpenDialogJobCounter) return;

						untrack(() => {
							if (dialogBoxNode) {
								const focableNodes = getFocusable(dialogBoxNode);

								let focusTarget = dialogBoxNode;
								if (focableNodes.length > 0) {
									focusTarget = focableNodes[0];
								}

								engineElementInteraction.focus(focusTarget);
							}
						});
					});
				}
				return () => {
					hotKeysModule.removeHotKey(kbKey('Escape'), closeDialogHandler);
					dialogCloseCleanup();
				};
			}
		});
	});
</script>

{#if dialogController.activeDialog}
	<NavigationScope scopeId={dialogAnchorId}>
		<div
			class="dialog-anchor"
			onpointerdown={(e) => {
				if (e.currentTarget === e.target) dialogController.closeAllDialogs();
			}}
			transition:fade={{ duration: 200 }}
		>
			<div bind:this={dialogBoxNode} aria-modal="true" class="dialog-box" role="dialog" tabindex="-1">
				{@render dialogController.activeDialog?.renderSnippet()}
			</div>
		</div>
	</NavigationScope>
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
