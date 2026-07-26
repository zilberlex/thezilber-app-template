<script lang="ts" generics="TFace extends RenderableInput">
	import type { RenderableProps } from '$lib/engine/ui-infra/composable-renderable';

	import type {
		DirectFaceSiteProps,
		RenderableInput
	} from './candidate-types';
	import DirectRenderableSite from './DirectRenderableSite.svelte';

	let publicProps: DirectFaceSiteProps<TFace> = $props();

	const runtimeProps = $derived(
		publicProps as unknown as {
			face: RenderableInput;
			faceProps?: RenderableProps;
		}
	);
</script>

<div class="face-site">
	<DirectRenderableSite
		renderable={runtimeProps.face}
		props={runtimeProps.faceProps}
	/>
</div>

<style>
	.face-site {
		display: inline-grid;
		place-items: center;

		min-inline-size: 12rem;
		min-block-size: 4rem;

		border: 1px dashed currentColor;
		border-radius: 0.5rem;
		padding: 1rem;
	}
</style>
