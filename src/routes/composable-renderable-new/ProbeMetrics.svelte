<script lang="ts">
	let {
		mounts,
		destroys,
		rootPreserved,
		internalValue,
		inputValue
	}: {
		mounts: number;
		destroys: number;
		rootPreserved: boolean;
		internalValue?: number;
		inputValue?: string;
	} = $props();
</script>

<dl>
	<div><dt>Mounts</dt><dd>{mounts}</dd></div>
	<div><dt>Destroys</dt><dd>{destroys}</dd></div>
	<div><dt>Original root preserved</dt><dd>{rootPreserved}</dd></div>
	<div><dt>Reported local state</dt><dd>{internalValue ?? 'not mounted'}</dd></div>
	<div><dt>Reported input value</dt><dd>{inputValue ?? 'not mounted'}</dd></div>
</dl>

<style>
	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.5rem;
		margin: 0;
		font-size: 0.875rem;
	}

	div {
		padding: 0.5rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.35rem;
	}

	dt {
		opacity: 0.7;
	}

	dd {
		margin: 0.25rem 0 0;
		font-weight: 600;
		overflow-wrap: anywhere;
	}
</style>
