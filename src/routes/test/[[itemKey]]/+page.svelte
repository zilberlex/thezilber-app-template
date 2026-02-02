<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { CommandBuilderRepo } from '../../command-builder/[[itemKey]]/command-builder-state-store';
	import { commandBuilderRecordAdapter } from '../../command-builder/[[itemKey]]/command-builder-types';
	import { collectionAppInit } from './NewArchitecture.svelte';

	let loadingPlaceHolderState: PermanentCommandBuilderState = {
		commandName: '_draft_',
		commandStr: 'loading',
		formData: {}
	};

	let repo = new CommandBuilderRepo();

	let appEnvironment: CollectionAppEnvironmentTemp<PermanentCommandBuilderState> =
		collectionAppInit(
			page,
			loadingPlaceHolderState,
			{
				commandName: '_draft_',
				commandStr: 'New Command',
				formData: []
			},
			commandBuilderRecordAdapter,
			repo
		);
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
			appEnvironment.data.commandStr = appEnvironment.data.commandStr + '1';
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
			appEnvironment.saveAs('1');
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
