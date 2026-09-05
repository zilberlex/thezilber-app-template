<script
	lang="ts"
	generics="
		TSurface extends ChildCapableRenderable = ChildCapableRenderable,
		TFace extends AnyRenderable = AnyRenderable,
		TBackFace extends AnyRenderable = AnyRenderable
	"
>
	import { mergeProps } from 'svelte-toolbelt';

	import type { AnyRenderable, ChildCapableRenderable } from '$lib/engine/ui-infra/composable-renderable';

	import Element3D from './Element3D.svelte';
	import type { Element3DProps, FlippableElement3DProps } from './types';

	let { thisElement = $bindable(), ...element3DProps }: FlippableElement3DProps<TSurface, TFace, TBackFace> = $props();

	let rotateX = $state(0);

	function flip() {
		rotateX += 180;
	}

	const resolvedProps = $derived(
		mergeProps(element3DProps, {
			rotateX,
			onmouseenter: flip,
			onmouseleave: flip,
			style: '--td-transform-time: 700ms;'
		}) as Element3DProps<TSurface, TFace, TBackFace>
	);
</script>

<Element3D {...resolvedProps} bind:thisElement />
