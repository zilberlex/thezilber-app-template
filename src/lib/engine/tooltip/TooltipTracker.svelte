<script lang="ts">
	import { HotkeyTooltipAttribute } from './tooltip-consts';
	import { tooltipState } from './tooltip-state.svelte';

	function setTooltip(el: Element | null, text: string | null) {
		tooltipState.target = el;
		tooltipState.text = text;
	}

	function onPointerOver(event: PointerEvent) {
		const node = (event.target as Element)?.closest?.(`[${HotkeyTooltipAttribute}]`);

		if (!node) return;

		const text = node.getAttribute(HotkeyTooltipAttribute);

		const current = tooltipState.target;
		if (node === current) return;

		setTooltip(node, text);
	}

	function onPointerOut(event: PointerEvent) {
		const to = event.relatedTarget as Element | null;

		// If we moved into another tooltip-bearing element, let pointerover handle it.
		if (to?.closest?.(HotkeyTooltipAttribute)) return;

		setTooltip(null, null);
	}
</script>

<svelte:document on:pointerover={onPointerOver} on:pointerout={onPointerOut} />
