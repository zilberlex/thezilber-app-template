<script lang="ts">
	import { page } from '$app/state';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte';
	import TooltipElement from '$lib/ui/basic-components/TooltipElement.svelte';
	import TooltipAssigner from '$lib/ui/components/tooltips/TooltipAssigner.svelte';
	import { onDestroy } from 'svelte';
	import { cbRepo } from '../../command-builder/[[itemKey]]/app-repo';
	import {
		cbRecordAdaper,
		type CbState
	} from '../../command-builder/[[itemKey]]/command-builder-types';

	let loadingPlaceHolderState: CbState = {
		commandName: '_draft_',
		commandStr: 'loading',
		formData: {}
	};

	let newCommandFallback: CbState = {
		commandName: '_draft_',
		commandStr: 'New Command',
		formData: {}
	};

	let appEnvironment: CollectionAppEnvironment<CbState> = collectionAppInit(
		loadingPlaceHolderState,
		newCommandFallback,
		cbRecordAdaper,
		cbRepo
	);

	let elementWithTooltip = $state();
	let lol = $state(true);

	function toggleLol() {
		lol = !lol;
		console.log('lol', lol);
	}

	onDestroy(() => appEnvironment.destroy());

	// new api:
	// createCollectionAppPersistancyInfra(type) -> recordAdapter, repo
	// hemm - the problem is that i will need to refactor the smartRepot
	// ok this is a different refactor  because that would create risk.
	//
	// Next step refactor places for app pieces
	// write on paper the main classes and pieces, and make shit organized
	//

	let num = $state(13);

	appState.debug.viewObject = page;

	// $effect(() => {
	// 	appState.debug.debugConsole = true;
	// 	return () => {
	// 		appState.debug.debugConsole = false;
	// 	};
	// });
</script>

<div class="flex-col">
	<div class="box">
		EditMode: {appEnvironment.editMode}
	</div>
	<div class="box">
		{JSON.stringify(appEnvironment.data)}
	</div>
	<div class="box">
		data state: {appEnvironment.dataState}
	</div>
	<div class="box">
		itemKey: {appEnvironment.itemKey}
	</div>
	<InputCombo bind:value={num}>Added Num</InputCombo>
	<Button
		onclick={() => {
			appEnvironment.data.commandStr = appEnvironment.data.commandStr + num.toString();
		}}
	>
		change data
	</Button>
	<Button
		onclick={() => {
			appEnvironment.save();
		}}
	>
		Save
	</Button>
	<Button
		onclick={() => {
			appEnvironment.saveAs(num.toString());
		}}
	>
		SaveAs
	</Button>

	<Button
		onclick={() => {
			appEnvironment.delete();
		}}
	>
		{appEnvironment.editMode === 'permanent' ? 'Delete' : 'Clear Draft'}
	</Button>

	<div class="tooltip-test-field" bind:this={elementWithTooltip}>Some field with a tooltip</div>
</div>

<Button {@attach createClickHotKeyAttachment('lol', 'p')} onclick={() => toggleLol()}>
	toggle tooltip {lol}
</Button>
<TooltipAssigner anchorElement={elementWithTooltip} show={lol}
	>This is the tooltip {lol}</TooltipAssigner
>
