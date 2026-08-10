<script lang="ts">
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import type { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import { NAVIGATION_MANAGER_CONTEXT } from '$lib/engine/keyboard-navigation/svelte-components/consts';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';
	import { getContext } from 'svelte';

	let navigationManager = getContext<NavigationManager>(NAVIGATION_MANAGER_CONTEXT);

	let debugInfo = $state(navigationManager._debugInfo());

	let debugInfoDisplay = $derived({
		currentScopeName: debugInfo.currentScopeName,
		currentScopeIndex: debugInfo.currentScopeIndex,
		totalScopes: debugInfo.scopes.length,
		scopeNames: debugInfo.scopes.map((x) => x.scopeName)
	});
</script>

<div class="navigation-manager-debug content-surface">
	<Button
		{@attach createClickHotKeyAttachment('Refresh', false, hotkey('r', 'alt'))}
		onclick={() => (debugInfo = navigationManager._debugInfo())}>Refresh</Button
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
		pointer-events: auto;
	}
</style>
