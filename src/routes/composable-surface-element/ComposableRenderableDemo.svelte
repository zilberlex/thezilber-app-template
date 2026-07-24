<script
	lang="ts"
	generics="
		TSurface extends Surface,
		TFace extends Face = Face
	"
>
	import { renderRenderable } from '$lib/engine/ui-infra/composable-renderable/composable-renderable-renderer.svelte';
	import type {
		Face,
		FaceChildrenProps,
		Surface,
		SurfaceProps
	} from '$lib/engine/ui-infra/composable-renderable/types';

	export type ComposableRenderableDemoProps<
		TSurface extends Surface,
		TFace extends Face = Face
	> = SurfaceProps<TSurface> & FaceChildrenProps<TFace>;

	let {
		surface,
		surfaceProps = {},
		face,
		faceProps,
		children
	}: ComposableRenderableDemoProps<TSurface, TFace> = $props();

	const resolvedFace = $derived(face ?? children);

	const resolvedSurfaceProps = $derived(surfaceProps ?? {});

	const resolvedFaceProps = $derived(faceProps ?? {});
</script>

{#snippet renderedFace()}
	{@render renderRenderable({
		renderable: resolvedFace,
		renderableProps: resolvedFaceProps
	})}
{/snippet}

{@render renderRenderable({
	renderable: surface,
	renderableProps: resolvedSurfaceProps,
	content: renderedFace
})}
