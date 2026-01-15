<script lang="ts">
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
	import AppUI from './AppUI.svelte';
	import type { AppModel, LoadResult } from './app-types';

	const { data } = $props<{ data: LoadResult }>();

	let error = $state<unknown>(null);

	let state = $state({
		status: 'loading',
		model: data.initialModel
	});

	$effect(() => {
		let cancelled = false;

		state.status = 'loading';
		state.model = data.initialModel;
		error = null;

		data.modelPromise
			.then((loaded) => {
				if (cancelled) return;
				state.model = loaded;
				state.status = 'ready';
			})
			.catch((e) => {
				if (cancelled) return;
				error = e;
				state.status = 'error';
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		track(state);
		console.log('state', state);
	});
</script>

<AppUI model={state.model} status={state.status} />

{#if state.status === 'error'}
	<div class="err">Failed: {String(error)}</div>
{/if}

<style>
	.err {
		margin-top: 10px;
		color: #ff6b6b;
		font:
			14px/1.4 system-ui,
			sans-serif;
	}
</style>
