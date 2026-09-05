<script lang="ts" generics="T extends string">
	import { onMount, type Snippet } from 'svelte';

	const { targetLayer, children }: { targetLayer: T; children: Snippet } = $props();

	let thisElement = $state<HTMLElement>();

	onMount(() => {
		const portalTarget = document.querySelector(`.${CSS.escape(targetLayer)}`);

		if (!portalTarget || !thisElement) throw new Error(`Portal Item Expected Layer be Present [${targetLayer}]`);

		portalTarget.appendChild(thisElement);

		console.log('appending child', thisElement, 'targetLayer', portalTarget);

		return () => {
			if (!thisElement) {
				console.warn('element does not exist any longer, portalTarget', portalTarget);
				return;
			}

			portalTarget.removeChild(thisElement);
		};
	});
</script>

<div bind:this={thisElement}>
	{@render children()}
</div>

<style>
	div {
		display: contents;
	}
</style>
