<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		key,
		value,
		onClickCopy,
		...rest
	}: HTMLButtonAttributes & {
		key: any;
		value: any;
		onClickCopy?: (key: any, value: any) => void;
	} = $props();
</script>

<button class="item-display" onclick={() => onClickCopy?.(key, value)} {...rest}>
	<div class="key">
		{key}
	</div>
	<div>
		{value}
	</div>
</button>

<style>
	.item-display {
		display: flex;
		flex-direction: column;
		margin: 8px;
		align-items: center;

		--base-border-thin: var(--border-thin) solid var(--cl-primary);

		&:hover {
			border: var(--base-border-thick);
		}

		& .key {
			color: var(--cl-primary);
		}
	}
</style>
