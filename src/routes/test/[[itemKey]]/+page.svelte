<script lang="ts">
	import { page } from '$app/state';
	import { collectionAppInit } from '$lib/app-infrastructure/collection-app/environement.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { CommandBuilderRepo } from '../../command-builder/[[itemKey]]/command-builder-state-store';
	import {
		commandBuilderRecordAdapter,
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

	let repo = new CommandBuilderRepo();

	let appEnvironment: CollectionAppEnvironmentTemp<CbState> = collectionAppInit(
		page,
		loadingPlaceHolderState,
		newCommandFallback,
		commandBuilderRecordAdapter,
		repo
	);

	// new api:
	// createCollectionAppPersistancyInfra(type) -> recordAdapter, repo
	// hemm - the problem is that i will need to refactor the smartRepot
	// ok this is a different refactor  because that would create risk.
	//
	// Next step refactor places for app pieces
	// write on paper the main classes and pieces, and make shit organized
	//
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
	<Button
		onclick={() => {
			appEnvironment.data.commandStr = appEnvironment.data.commandStr + '4';
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
			appEnvironment.saveAs('4');
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
</div>
