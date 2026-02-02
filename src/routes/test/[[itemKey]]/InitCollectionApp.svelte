<script lang="ts" generics="TData">
	import { onMount } from 'svelte';
	import { SmartStore, type SmartStoreOptions } from './SmartStore.svelte';
	import { browser } from '$app/environment';

	type CollectionAppProps<TData> = {
		appEnvironment: CollectionAppEnvironmentTemp<TData>;
		dataPlaceholder: TData;
		repo: AppRecordRepo<TData>;
	};

	let { appEnvironment = $bindable(), dataPlaceholder, repo }: CollectionAppProps<TData> = $props();

	let storeOptions: SmartStoreOptions<TData> = {
		loadNotFoundBehavior: {
			action: 'create-new',
			createObj: () => ({
				commandStr: 'New Command {lol}',
				formData: {}
			})
		}
	};

	onMount(() => {
		if (browser) {
			let collectionAppContext = initCollectionAppContext();
			let store = $state(
				new SmartStore<TData>(collectionAppContext, dataPlaceholder, repo, storeOptions)
			);

			appEnvironment.editMode = collectionAppContext.editMode;
			appEnvironment.itemKey = collectionAppContext.itemKey;
			appEnvironment.data = store.data;
			appEnvironment.dataState = store.dataState;
		}
	});

	function initCollectionAppContext(): CollectionAppContext {
		return {
			itemKey: '_draft_',
			editMode: 'draft'
		};
	}
</script>
