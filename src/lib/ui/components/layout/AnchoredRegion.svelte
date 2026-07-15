<script lang="ts">
	import type { Snippet } from 'svelte';

	type CSSValue = string | number;

	type HorizontalAlignment = 'left' | 'center' | 'right' | 'stretch';
	type VerticalAlignment = 'top' | 'center' | 'bottom' | 'stretch';

	type Props = {
		children: Snippet;

		top?: CSSValue;
		right?: CSSValue;
		bottom?: CSSValue;
		left?: CSSValue;

		width?: CSSValue;
		height?: CSSValue;

		minWidth?: CSSValue;
		maxWidth?: CSSValue;
		minHeight?: CSSValue;
		maxHeight?: CSSValue;

		alignX?: HorizontalAlignment;
		alignY?: VerticalAlignment;

		zIndex?: string | number;

		pointerEvents?: 'auto' | 'none';
		contentPointerEvents?: 'auto' | 'none';
	};

	let {
		children,

		top,
		right,
		bottom,
		left,

		width,
		height,

		minWidth,
		maxWidth,
		minHeight,
		maxHeight,

		alignX = 'stretch',
		alignY = 'stretch',

		zIndex,

		pointerEvents = 'none',
		contentPointerEvents = 'auto'
	}: Props = $props();

	function cssValue(value: CSSValue | undefined): string | undefined {
		if (value === undefined) return undefined;
		return typeof value === 'number' ? `${value}px` : value;
	}

	const regionStyle = $derived(`
		top: ${cssValue(top) ?? 'auto'};
		right: ${cssValue(right) ?? 'auto'};
		bottom: ${cssValue(bottom) ?? 'auto'};
		left: ${cssValue(left) ?? 'auto'};

		width: ${cssValue(width) ?? 'auto'};
		height: ${cssValue(height) ?? 'auto'};

		min-width: ${cssValue(minWidth) ?? 'auto'};
		max-width: ${cssValue(maxWidth) ?? 'none'};
		min-height: ${cssValue(minHeight) ?? 'auto'};
		max-height: ${cssValue(maxHeight) ?? 'none'};

		z-index: ${zIndex ?? 'auto'};
		pointer-events: ${pointerEvents};
	`);

	const contentStyle = $derived(`
		pointer-events: ${contentPointerEvents};
	`);
</script>

<div
	class="anchored-region"
	class:align-x-left={alignX === 'left'}
	class:align-x-center={alignX === 'center'}
	class:align-x-right={alignX === 'right'}
	class:align-x-stretch={alignX === 'stretch'}
	class:align-y-top={alignY === 'top'}
	class:align-y-center={alignY === 'center'}
	class:align-y-bottom={alignY === 'bottom'}
	class:align-y-stretch={alignY === 'stretch'}
	style={regionStyle}
>
	<div class="anchored-region-content" style={contentStyle}>
		{@render children()}
	</div>
</div>

<style>
	.anchored-region {
		position: absolute;
		display: flex;
		flex-direction: column;

		box-sizing: border-box;

		min-width: 0;
		min-height: 0;
	}

	.anchored-region-content {
		box-sizing: border-box;

		min-width: 0;
		min-height: 0;

		max-width: 100%;
		max-height: 100%;
	}

	.align-x-left {
		align-items: flex-start;
	}

	.align-x-center {
		align-items: center;
	}

	.align-x-right {
		align-items: flex-end;
	}

	.align-x-stretch {
		align-items: stretch;
	}

	.align-x-stretch > .anchored-region-content {
		width: 100%;
	}

	.align-y-top {
		justify-content: flex-start;
	}

	.align-y-center {
		justify-content: center;
	}

	.align-y-bottom {
		justify-content: flex-end;
	}

	.align-y-stretch > .anchored-region-content {
		height: 100%;
	}
</style>
