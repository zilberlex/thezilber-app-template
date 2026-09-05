<script lang="ts">
	import type { Snippet } from 'svelte';

	type CSSValue = string | number;

	type AxisAnchor = 'start' | 'center' | 'end' | 'stretch';

	type Props = {
		children: Snippet;

		anchorX?: AxisAnchor;
		anchorY?: AxisAnchor;

		/**
		 * Reduces the available anchor area.
		 *
		 * Supports normal CSS shorthand:
		 * inset="8px"
		 * inset="8px 16px"
		 * inset="8px 16px 24px 32px"
		 */
		inset?: CSSValue;

		/**
		 * Physical displacement after anchoring.
		 * Positive values move right/down.
		 */
		offsetX?: CSSValue;
		offsetY?: CSSValue;

		minWidth?: CSSValue;
		maxWidth?: CSSValue;
		minHeight?: CSSValue;
		maxHeight?: CSSValue;

		zIndex?: string | number;

		pointerEvents?: 'auto' | 'none';
		contentPointerEvents?: 'auto' | 'none';
	};

	let {
		children,

		anchorX = 'stretch',
		anchorY = 'stretch',

		inset = 0,

		offsetX = 0,
		offsetY = 0,

		minWidth,
		maxWidth,
		minHeight,
		maxHeight,

		zIndex,

		pointerEvents = 'none',
		contentPointerEvents = 'auto'
	}: Props = $props();

	function cssValue(value: CSSValue | undefined): string | undefined {
		if (value === undefined) return undefined;
		return typeof value === 'number' ? `${value}px` : value;
	}

	const regionStyle = $derived(`
		--anchored-region-inset: ${cssValue(inset)};
		--anchored-region-offset-x: ${cssValue(offsetX)};
		--anchored-region-offset-y: ${cssValue(offsetY)};

		z-index: ${zIndex ?? 'auto'};
		pointer-events: ${pointerEvents};
	`);

	const contentStyle = $derived(`
		justify-self: ${anchorX};
		align-self: ${anchorY};

		min-width: ${cssValue(minWidth) ?? '0'};
		max-width: ${cssValue(maxWidth) ?? '100%'};
		min-height: ${cssValue(minHeight) ?? '0'};
		max-height: ${cssValue(maxHeight) ?? '100%'};

		pointer-events: ${contentPointerEvents};
	`);
</script>

<div class="anchored-region" style={regionStyle}>
	<div class="anchored-region-content" style={contentStyle}>
		{@render children()}
	</div>
</div>

<style>
	.anchored-region {
		position: absolute;
		inset: 0;

		display: grid;

		box-sizing: border-box;
		padding: var(--anchored-region-inset, 0);

		min-width: 0;
		min-height: 0;
	}

	.anchored-region-content {
		box-sizing: border-box;

		translate: var(--anchored-region-offset-x, 0) var(--anchored-region-offset-y, 0);

		min-width: 0;
		min-height: 0;
	}
</style>
