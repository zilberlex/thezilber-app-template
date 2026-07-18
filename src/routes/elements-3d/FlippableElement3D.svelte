<script lang="ts">
	import type { Snippet } from 'svelte';
	import RotatableElement3D from './RotatableElement3D.svelte';

	let {
		front,
		back,
		surface
	}: {
		front: Snippet;
		back?: Snippet;
		surface?: Snippet<[content: Snippet]>;
	} = $props();

	let rotation = $state(0);
	function flip() {
		rotation += 180;
	}
</script>

<RotatableElement3D rotateX={rotation} onmouseenter={flip} onmouseleave={flip} {front} {back} {surface} />
