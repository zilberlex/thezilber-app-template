<script lang="ts">
	import type { CollectionAppEnvironment } from '$lib/app-infrastructure/collection-app/types';
	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import { untrack } from 'svelte';

	let { appEnv }: { appEnv: CollectionAppEnvironment<any, any> } = $props();

	let currentDataState = $derived(appEnv.currentDataState);
	let projectedDataState = $derived(appEnv.projectedDataState);

	let editMode = $derived(appEnv.editMode);

	$effect(() => {
		track(currentDataState, projectedDataState);

		untrack(() => {
			let dataState = projectedDataState ?? currentDataState;
			let message = '';
			switch (dataState.kind) {
				case 'saving':
					message =
						editMode === 'permanent'
							? `Saving Command [${dataState.slug}]...`
							: `Saving Draft As...`;
					break;
				case 'loading':
					message =
						editMode === 'permanent'
							? `Loading Command [${dataState.slug}]...`
							: `Loading Draft...`;
					break;
				case 'record-not-found':
					message = `Record Not Found [${dataState.slug}]`;
					break;
				case 'ready':
					message = editMode === 'permanent' ? `Ready [${dataState.slug}]` : `Draft Ready`;
					break;
				case 'creating':
					message =
						editMode === 'permanent'
							? `Saving As [${dataState.slug}]`
							: `Saving Draft as [${dataState.slug}]`;
					break;
				case 'deleting':
					message = `Deleting Item: [${dataState.slug}]`;
					break;
				case 'deleted':
					message = `Successfully Deleted Item: [${dataState.slug}]`;
					break;
				case 'error':
					message = `Error in Operation: [${dataState.slug}].  Error Data: [${JSON.stringify(dataState.errorData)}]`;
					break;
			}

			if (!message) message = 'Critical Error';

			let suffix = appState.debug
				? `. (Previous Key [${'prevKey' in dataState ? (dataState.prevKey ?? '') : ''}])`
				: '';

			temporaryMessageState.message = message + suffix;
		});
	});
</script>
