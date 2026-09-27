<script lang="ts">
	import { fade } from 'svelte/transition';
	import { tick, untrack } from 'svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { onNavigate } from '$app/navigation';
	import { hotkeyManager } from '@svelte-ascend/hotkey-module';
	import type { FocusableElement } from '@svelte-ascend/interactions';
	import { safeInstanceOf } from '$lib/engine/types/type-utils';
	import { track } from '@svelte-ascend/core/svelte';
	import { KeyboardNavigationScope } from '@svelte-ascend/keyboard-navigation/svelte';
	import type { DialogController } from './dialog-contoller.svelte';
	import { getFocusable } from '@svelte-ascend/interactions';
	import { engineElementInteraction } from '$lib/engine/engine-hotkeys/engine-interactions';
	import { kbKey } from '@svelte-ascend/core';

	let dialogBoxNode: HTMLElement | null = $state(null);
	let appRoot = $derived(appState.appRoot);

	const propsId = $props.id();
	let dialogAnchorId = `dialog-anchor-${propsId}`;

	let { dialogController }: { dialogController: DialogController } = $props();

	let lastFocusedElement: FocusableElement | null = null;

	let focusOpenDialogJobCounter = 0;

	onNavigate(() => {
		dialogController.closeAllDialogs();
	});

	const closeDialogHandler = () => {
		dialogController.closeAllDialogs();
	};

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
			if (!dialogController.activeDialog) return;

			const cleanupHotkey = hotkeyManager.assignHotKey(kbKey('Escape'), closeDialogHandler, { isCapture: true });

			const thisJob = ++focusOpenDialogJobCounter;
			const activeElement = document.activeElement;
			lastFocusedElement = safeInstanceOf(activeElement);

			tick().then(() => {
				if (thisJob !== focusOpenDialogJobCounter) return;

				untrack(() => {
					if (!dialogBoxNode) return;

					const focusableNodes = getFocusable(dialogBoxNode);

					const focusTarget = focusableNodes.length > 0 ? focusableNodes[0] : dialogBoxNode;

					engineElementInteraction.focus(focusTarget);
				});
			});

			return () => {
				cleanupHotkey();
				dialogCloseCleanup();
			};
		});
	});
</script>

{#if dialogController.activeDialog}
	<KeyboardNavigationScope scopeId={dialogAnchorId}>
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
	</KeyboardNavigationScope>
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
