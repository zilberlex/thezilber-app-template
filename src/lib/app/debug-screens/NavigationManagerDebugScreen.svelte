<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import type { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import { getNavigationManager } from '$lib/engine/keyboard-navigation/svelte-components/navigation-manager-provider.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';

	let { navigationManager }: { navigationManager?: NavigationManager } = $props();

	// svelte-ignore state_referenced_locally
	const navigationManagerDerived = $derived(navigationManager ?? getNavigationManager());

	let debugInfo = $state(navigationManagerDerived._debugInfo());

	let debugInfoDisplay = $derived({
		currentScopeName: debugInfo.currentScopeName,
		currentScopeIndex: debugInfo.currentScopeIndex,
		totalScopes: debugInfo.scopes.size,
		scopeNames: [...debugInfo.scopes.values()].map((x) => x.scope?.scopeId),
		currentTargetElementClasses: debugInfo.currentNavigationTarget?.targetElement?.classList.toString() ?? 'undefined',
		currentNodeClasses: debugInfo.currentNavigationTarget?.navigatableNode?.classList.toString() ?? 'undefined',
		currentTargetElementAttributes: displayDataAttributes(debugInfo.currentNavigationTarget?.targetElement),
		currentTargetNode: debugInfo.currentNavigationTarget?.targetElement,
		currentNode: debugInfo.currentNavigationTarget?.navigatableNode,
		currentScope: debugInfo.currentScope
	});

	function displayDataAttributes(element?: HTMLElement) {
		if (!element) return undefined;

		return Object.fromEntries(
			Array.from(element.attributes)
				.filter((attr) => attr.name.startsWith('data-'))
				.map((attr) => [attr.name, attr.value])
		);
	}
</script>

<div class="navigation-manager-debug content-surface">
	<Button
		{@attach createClickHotKeyAttachment('Refresh', hotkey('r', 'alt'))}
		onclick={() => (debugInfo = navigationManagerDerived._debugInfo())}>Refresh</Button
	>
	<ObjectViewer object={debugInfoDisplay} />
</div>

<style>
	.navigation-manager-debug {
		position: absolute;
		opacity: 0.8;
		inset: var(--space-2);
		max-width: 500px;
		max-height: 500px;
		overflow-y: scroll;
		pointer-events: auto;
	}
</style>
