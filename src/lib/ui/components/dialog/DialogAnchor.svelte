<script lang="ts">
	import { fade } from 'svelte/transition';
	import { activeDialogController, activeDialogState } from './dialog-context.svelte';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import { getFocusableElementsByNode } from '$lib/engine/keyboard-navigation/navigation-utils';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onNavigate } from '$app/navigation';
	import { createSmartHandler } from '$lib/engine/events/event-handling';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';

	let dialogBoxNode: HTMLElement | null = $state(null);
	let appRoot = $derived(appState.appRoot);

	let lastFocusedElement: HTMLElement | SVGElement | null = null;

	let focusOpenDialogJobCounter = 0;

	onDestroy(() => {
		cleanupComponent();
	});

	onNavigate(() => {
		cleanupComponent();
		hotKeysModule.removeHotKey(new HotKey('Escape'), closeDialogHandler);
	});

	onMount(() => {
		hotKeysModule.assignHotKey(new HotKey('Escape'), closeDialogHandler);
	});

	const closeDialogHandler = createSmartHandler(
		() => {
			activeDialogController.closeAllActiveDialogs();
		},
		{ cooldownDelay: 20 }
	);

	function cleanupComponent() {
		activeDialogController.closeAllActiveDialogs();
		dialogCloseCleanup();
	}

	function dialogCloseCleanup() {
		focusOpenDialogJobCounter++;
		if (appRoot) {
			appRoot.inert = false;
		}

		if (lastFocusedElement && document.contains(lastFocusedElement))
			lastFocusedElement?.focus({ preventScroll: true });
	}

	$effect(() => {
		if (!appRoot) return;

		if (activeDialogState.isOpen) {
			const thisJob = ++focusOpenDialogJobCounter;
			const activeElement = document.activeElement;
			lastFocusedElement =
				activeElement instanceof HTMLElement || activeElement instanceof SVGElement
					? activeElement
					: null;
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
						focusTarget.focus();
					}
				});
			});
		} else {
			dialogCloseCleanup();
		}
	});
</script>

{#if activeDialogState.isOpen && activeDialogState.activeElementRender}
	<div
		class="dialog-anchor"
		onpointerdown={(e) => {
			if (e.currentTarget === e.target) activeDialogController.closeAllActiveDialogs();
		}}
		transition:fade={{ duration: 200 }}
	>
		<div bind:this={dialogBoxNode} aria-modal="true" class="dialog-box" role="dialog" tabindex="-1">
			{@render activeDialogState.activeElementRender()}
		</div>
	</div>
{/if}

<style>
	.dialog-anchor {
		position: fixed;
		inset: 0;
		backdrop-filter: blur(2px) grayscale(0.5);
		background-color: rgb(0 0 0 / 0.5);
		z-index: 10;
		pointer-events: auto;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dialog-box {
		outline: none;

		&:focus-within {
			animation: focus-ring-focus 500ms ease-out 0ms 1 forwards;
		}
	}
</style>
