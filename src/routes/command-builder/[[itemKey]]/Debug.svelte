<script lang="ts">
	import type { CollectionAppEnvironment } from '$lib/app-infrastructure/collection-app/types';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';

	type Props = {
		appEnv: CollectionAppEnvironment<any>;
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

	appState.debug.viewObjects.set('Record Key and Context Correlation Helper', debugHelper);

	$effect(() => {
		appState.debug.viewObjects.set('Projected Context', appEnv.projectedContext);
		appState.debug.viewObjects.set('Projected DataState', appEnv.projectedDataState);
	});
</script>
