<script lang="ts">
	import type { CollectionAppEnvironment } from '$lib/app-infrastructure/collection-app/types';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';

	type Props = {
		appEnv: CollectionAppEnvironment<any, any>;
	};

	let { appEnv }: Props = $props();

	let debugHelper = $state({
		bigIssue: 'All Good'
	});

	$effect(() => {
		let contextSlug = appEnv.slug;
		let slug = appEnv._internal.store.slug;

		debugHelper.bigIssue =
			slug !== contextSlug
				? `Context slug does dot correspond with record slug - context slug: [${contextSlug}], record slug: [${slug}]`
				: 'All Good';
	});

	appState.debug.viewObjects.set('Context Aligment Tracker', debugHelper);

	$effect(() => {
		let dataState = appEnv.currentDataState;
		track(dataState);
		appState.debug.viewObjects.set('CurrentDataState', dataState);
		appState.debug.viewObjects.set('DataStates Debug', appEnv.dataStates);
	});

	$effect(() => {
		appState.debug.viewObjects.set('Projected Context', appEnv.projectedContext);
		appState.debug.viewObjects.set('Projected DataState', appEnv.projectedDataState);
	});

	$effect(() => {
		let projections = appEnv.allRecordProjections.toValueArray();
		appState.debug.viewObjects.set('RecordProjections', projections);
	});
</script>
