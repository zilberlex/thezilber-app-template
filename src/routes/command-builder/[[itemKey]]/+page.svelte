<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import SidebarAppShell from '$lib/ui/components/appshells/SidebarAppShell.svelte';
	import { onDestroy } from 'svelte';
	import CommandLineBuilderMain from './CommandLineBuilderMain.svelte';
	import { cbDbAdapter } from './command-builder-db-adapter';
	import type { CbAppEnv, CbData, CbProjection } from './command-builder-types';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import CommandBuilderSidebar from './CommandBuilderSidebar.svelte';

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

	let cbAppEnv: CbAppEnv = collectionAppInit<CbData, CbProjection>(
		placeholderData,
		draftData,
		cbDbAdapter,
		'CommandBuilderDataDb'
	);

	onDestroy(() => {
		cbAppEnv.destroy();
	});

	appState.pageContext.title = 'Command Builder';
</script>

<SidebarAppShell>
	{#snippet title()}
		<h2>CommandBuilder</h2>
	{/snippet}
	{#snippet sidebar()}
		<CommandBuilderSidebar {cbAppEnv} />
	{/snippet}
	{#snippet main()}
		<CommandLineBuilderMain {cbAppEnv} />
	{/snippet}
</SidebarAppShell>
