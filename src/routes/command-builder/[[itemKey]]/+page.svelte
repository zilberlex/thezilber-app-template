<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import SidebarAppShell from '$lib/ui/components/appshells/SidebarAppShell.svelte';
	import CommandLineBuilderMain from './CommandLineBuilderMain.svelte';
	import { cbDbAdapter } from './command-builder-db-adapter';
	import type { CbAppEnv, CbData, CbProjection } from './command-builder-types';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import CommandBuilderSidebar from './CommandBuilderSidebar.svelte';
	import CommandBuilderNavigationKeys from './CommandBuilderNavigationKeys.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';

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

	let cbAppEnv = $state<CbAppEnv>();

	onMount(() => {
		appState.pageContext.title = 'Command Builder';

		appState.loadApp('CommandBuilder');
		cbAppEnv = collectionAppInit<CbData, CbProjection>(placeholderData, draftData, cbDbAdapter, 'CommandBuilderDataDb');
	});

	beforeNavigate(() => {
		cleanup();
	});

	onDestroy(() => {
		cleanup();
	});

	function cleanup() {
		appState.unloadApp();
		cbAppEnv?.destroy();
	}
</script>

<CommandBuilderNavigationKeys />

{#if cbAppEnv !== undefined}
	<SidebarAppShell>
		{#snippet title()}
			<h2>CommandBuilder</h2>
		{/snippet}
		{#snippet sidebar()}
			<CommandBuilderSidebar cbAppEnv={cbAppEnv as CbAppEnv} />
		{/snippet}
		{#snippet main()}
			<CommandLineBuilderMain bind:cbAppEnv={cbAppEnv as CbAppEnv} />
		{/snippet}
	</SidebarAppShell>
{:else}
	cbAppEnv Undefined
{/if}
