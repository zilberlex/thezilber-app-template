<script lang="ts">
	import { renderRenderable } from "$lib/engine/ui-infra/composable-renderable/composable-renderable-renderer.svelte";
	import { mergeProps } from "svelte-toolbelt";

  mergeProps()
  
  type Face = Renderable<'optional'>; 

  type ChildrenOrFace = {
    face: Renderable<'optional', infer FaceProps>,
    faceProps: FaceProps,
    children: never;
  } | {
    face: never,
    faceProps: never,
    children: Snippet
  }

  type CompositionComponentProps = {
    surface: Renderable<'required-children', Infer SurfaceProps>,
    surfaceProps:  SurfaceProps,
  } & ChildrenOrFace;

  let { surface, surfaceProps, face, faceProps, children, ...rest } = $props;

  let fullFaceProps = $derived.by(() => mergeProps(faceProps, {
    class: 'added-face-class'
  }));

  let fullSurfaceProps = $derived.by(() => mergeProps(faceProps, {
    class: 'added-surface-class',
    children: faceWrapper
  }));
</script>

{#snippet faceWrapper()}
	<div class="random-wrapper">
		{@render renderRenderable(face, fullFaceProps)}
	</div>
{/snippet}

<div class="surface-wrapper">
	{@render renderRenderable(surface, fullSurfaceProps)}
</div>
