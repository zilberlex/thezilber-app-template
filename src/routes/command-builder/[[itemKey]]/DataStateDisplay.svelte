<script lang="ts">
	import type { CollectionAppEnvironment } from '$lib/app-infrastructure/collection-app/types';
	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { untrack } from 'svelte';

	let { appEnv }: { appEnv: CollectionAppEnvironment<any> } = $props();

	let currentDataState = $derived(appEnv.currentDataState);
	let projectedDataState = $derived(appEnv.projectedDataState);

	let editMode = $derived(appEnv.editMode);

	$effect(() => {
		track(currentDataState, projectedDataState);
		console.log('WOW currentDataState', currentDataState);
		console.log('WOW projectedDataState', projectedDataState);

		untrack(() => {
			let dataState = projectedDataState ?? currentDataState;
			let message = '';
			switch (dataState.kind) {
				case 'saving':
					message =
						editMode === 'permanent'
							? `Saving Command [${dataState.key}]...`
							: `Saving Draft As...`;
					break;
				case 'loading':
					message =
						editMode === 'permanent' ? `Loading Command [${dataState.key}]...` : `Loading Draft...`;
					break;
				case 'record-not-found':
					message = `Record Not Found [${dataState.key}]`;
					break;
				case 'ready':
					message = editMode === 'permanent' ? `Ready [${dataState.key}]` : `Draft Ready`;
					break;
				case 'creating':
					message =
						editMode === 'permanent'
							? `Saving As [${dataState.key}]`
							: `Saving Draft as [${dataState.key}]`;
					break;
				default:
					message = `Error [${dataState.kind}]`;
			}

			let suffix = appState.debug
				? `. (Previous Key [${'prevKey' in dataState ? (dataState.prevKey ?? '') : ''}])`
				: '';

			temporaryMessageState.message = message + suffix;

			console.log('WOW message', message + suffix, 'DataState', dataState);
		});
	});
</script>
