<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Attachment } from 'svelte/attachments';

	export type TooltipVariant = 'info' | 'warn' | 'error';

	type Props = {
		thisElement?: HTMLElement;
		variant?: TooltipVariant;
		children: Snippet;
		open?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let { thisElement = $bindable(), variant = 'info', open = true, children, ...rest }: Props = $props();

	let measuredWidth = $state(0);
	let width = $derived(open ? measuredWidth : 0);

	const measureContent: Attachment<HTMLElement> = (element) => {
		const updateWidth = () => {
			measuredWidth = element.offsetWidth;
		};

		const observer = new ResizeObserver(updateWidth);
		observer.observe(element);
		updateWidth();

		return () => observer.disconnect();
	};
</script>

<div
	bind:this={thisElement}
	class="app-tooltip"
	data-tooltip-variant={variant}
	data-open={open}
	style:--tooltip-width={`${width}px`}
	{...rest}
>
	<div class="tooltip-content" {@attach measureContent}>
		{@render children()}
	</div>
</div>

<style>
	.app-tooltip {
		width: 0;
		overflow: hidden;
		min-width: 0;
		transition: width 300ms ease-in-out;
	}

	.app-tooltip[data-open='true'] {
		width: var(--tooltip-width);
	}

	.tooltip-content {
		width: max-content;
		padding: var(--base-padding);
	}
</style>
