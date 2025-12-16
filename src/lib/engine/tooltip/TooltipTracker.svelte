<script lang="ts">
	import { HotkeyTooltipAttribute } from './tooltip-consts';
	import { tooltipState } from './tooltip-state.svelte';

	function setTooltip(el: Element | null, text: string | null) {
		tooltipState.target = el;
		tooltipState.text = text;
	}

	function onPointerOver(e: PointerEvent) {
		const el = (e.target as Element)?.closest?.(`[${HotkeyTooltipAttribute}]`);

		if (!el) return;

		const text = el.getAttribute(HotkeyTooltipAttribute);

		const current = tooltipState.target;
		if (el === current) return;

		setTooltip(el, text);
	}

	function onPointerOut(e: PointerEvent) {
		const to = e.relatedTarget as Element | null;

		// If we moved into another tooltip-bearing element, let pointerover handle it.
		if (to?.closest?.(HotkeyTooltipAttribute)) return;

		setTooltip(null, null);
	}
</script>

<svelte:document on:pointerover={onPointerOver} on:pointerout={onPointerOut} />
