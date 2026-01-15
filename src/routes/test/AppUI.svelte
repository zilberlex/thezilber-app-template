<script lang="ts">
	import type { AppModel } from './app-types';

	const { model, status } = $props<{
		model: AppModel;
		status: 'loading' | 'ready' | 'error';
	}>();

	const locked = $derived(status !== 'ready');
</script>

<div class="app">
	<h1>{model.title}</h1>

	<input value={model.command} disabled={locked} />

	<button disabled={locked}>
		{locked ? 'Loading…' : 'Run'}
	</button>
</div>

<style>
	.app {
		display: grid;
		gap: 12px;
		padding: 16px;
		background: #111;
		color: #eee;
		width: 320px;
	}
	input,
	button {
		padding: 8px;
		background: #1a1a1a;
		color: #eee;
		border: 1px solid #333;
	}
	button:disabled,
	input:disabled {
		opacity: 0.6;
	}
</style>
