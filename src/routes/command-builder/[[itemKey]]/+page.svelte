<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import SidebarAppShell from '$lib/ui/components/appshells/SidebarAppShell.svelte';
	import { getContext, onDestroy, onMount, untrack } from 'svelte';
	import CommandLineBuilderMain from './CommandLineBuilderMain.svelte';
	import { cbDbAdapter } from './command-builder-db-adapter';
	import type { CbAppEnv, CbData, CbProjection } from './command-builder-types';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import CommandBuilderSidebar from './CommandBuilderSidebar.svelte';
	import { NAVIGATION_MANAGER_CONTEXT } from '$lib/engine/keyboard-navigation/svelte-components/consts';
	import type { NavigationManager } from '$lib/engine/keyboard-navigation/navigation-manager';
	import { hotkey, hotkeys } from '$lib/engine/hotkeys/hotkey-helpers';
	import { NavigationKeyConsts } from '$lib/engine/hotkeys/consts';
	import { browser } from '$app/environment';
	import { hotKeysModule } from '$lib/engine/hotkeys/hotkey-module';
	import {
		createKeyabordNavigationEventHandler,
		createKeyboardNavigationEventHandlerMixedSoftness
	} from '$lib/engine/hotkeys/bl-events';
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import CommandBuilderNavigationKeys from './CommandBuilderNavigationKeys.svelte';

	let placeholderData = {
		commandName: '',
		commandStr: 'Loading...',
		formData: {}
	};

	let draftData: CbData = {
		commandName: 'Draft Command',
		commandStr: 'cp -r {src} {dest}',
		formData: {
			src: { value: './origin/', schema: { type: 'string' } },
			dest: { value: './bkp/origin/', schema: { type: 'string' } }
		}
	};

	let cbAppEnv: CbAppEnv = $state(
		collectionAppInit<CbData, CbProjection>(placeholderData, draftData, cbDbAdapter, 'CommandBuilderDataDb')
	);

	onDestroy(() => {
		cbAppEnv.destroy();
	});

	appState.pageContext.title = 'Command Builder';
</script>

<CommandBuilderNavigationKeys />

<SidebarAppShell>
	{#snippet title()}
		<h2>CommandBuilder</h2>
	{/snippet}
	{#snippet sidebar()}
		<CommandBuilderSidebar {cbAppEnv} />
	{/snippet}
	{#snippet main()}
		<CommandLineBuilderMain bind:cbAppEnv />
	{/snippet}
</SidebarAppShell>
