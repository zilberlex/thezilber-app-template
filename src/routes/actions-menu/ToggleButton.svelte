<script lang="ts">
	import ToggleIcon from '$lib/assets/icons/ToggleIcon.svelte';
	import IconButton from '$lib/ui/basic-components/IconButton.svelte';
	import { mergeProps } from 'svelte-toolbelt';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type ToggleProps = {
		onToggle?: (toggleState: boolean) => void;
		toggleState?: boolean;
	} & HTMLButtonAttributes;

	let { onToggle, toggleState = $bindable(false), ...rest }: ToggleProps = $props();

	let mergedProps = $derived(() => {
		return mergeProps(rest);
	});
</script>

<IconButton
	onclick={() => {
		toggleState = !toggleState;
		onToggle?.(toggleState);
	}}
	{...mergedProps}
	style={{ '--bg': 'var(--cl-on-surface-dimmest)' }}
>
	<ToggleIcon style={{ '--icon-stroke': !toggleState ? 'transparent' : 'var(--cl-primary)' }} />
</IconButton>
