<script lang="ts">
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import { syncData } from '$lib/engine/storage/data/sync-logic-lww';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import ObjectViewer from '$lib/ui/components/ObjectViewer.svelte';

	let dId1 = 'cf5f4d08-a110-42a4-bad9-042a49915119';
	let dId2 = '17881089-de25-4a58-8d0a-aacfca971cfc';
	let syncedId = $state();

	type Data = {
		title: string;
	};

	let object1: SyncableData<Data> = $state({
		id: '645e88b9-596e-4d0b-bab2-d03c5d38dc39',
		data: {
			title: 'Version1'
		},
		vc: {
			[dId1]: 1
		},

		updatedAt: 10,
		updatedBy: dId1,
		testingInfo: 'object1'
	});

	let object2: SyncableData<Data> = $state({
		id: '645e88b9-596e-4d0b-bab2-d03c5d38dc39',
		data: {
			title: 'Version2'
		},
		vc: {
			[dId1]: 1,
			[dId2]: 1
		},

		updatedAt: 20,
		updatedBy: dId2,
		testingInfo: 'object2'
	});

	let synced: SyncableData<Data> | undefined = $state();

	let modCounter = 100;
	let currentTime = 30;
	function modify(device: DeviceId, obj: SyncableData<Data>) {
		obj.data.title = 'Version ' + modCounter.toString();
		obj.vc[device]++;
		obj.updatedAt = currentTime;
		obj.updatedBy = device;

		currentTime += 10;
		modCounter++;
	}
</script>

<div class="data-sync-simulator">
	<div class="object-compare">
		<div class="flex-col">
			<div class="device-lable">
				Device: {dId1}
			</div>
			<ObjectViewer object={object1} class="object-window box" recursive={true} />
		</div>
		<div class="flex-col">
			<div class="device-lable">
				Device: {dId2}
			</div>
			<ObjectViewer object={object2} class="object-window box" recursive={true} />
		</div>
		{#if synced}
			<div class="flex-col">
				<div class="device-lable">
					Synced Device: {syncedId}
				</div>
				<ObjectViewer
					object={synced}
					class="object-window box"
					recursive={true}
					style="--cl-primary: var(--color-5);"
				/>
			</div>
		{/if}
	</div>
	<NavigationScope
		scopeName="Sync Simulation Controls"
		navigationKeys={NavigationKeysConfigSets.Vertical}
	>
		<div class="controls flex-col">
			<Button onclick={() => modify(dId1, object1)}>Modify From Device 1</Button>
			<Button onclick={() => modify(dId2, object2)}>Modify From Device 2</Button>
			<Button
				onclick={() => {
					synced = syncData($state.snapshot(object1), $state.snapshot(object2));
					object1 = synced;
					syncedId = dId1;
				}}>Sync Device 1</Button
			>
			<Button
				onclick={() => {
					synced = syncData($state.snapshot(object2), $state.snapshot(object1));
					object2 = synced;
					syncedId = dId2;
				}}>Sync Device 2</Button
			>
		</div>
	</NavigationScope>
</div>

<style>
	.object-compare {
		display: flex;
		flex-direction: row;
		gap: var(--space-md);
		align-items: stretch;
		justify-content: space-evenly;

		margin-bottom: var(--space-2);
	}

	:global(.object-window) {
		height: stretch;
	}
	.controls {
		width: 25vw;
		margin-inline: auto;
		justify-content: stretch;
		gap: var(--space-2);
	}
</style>
