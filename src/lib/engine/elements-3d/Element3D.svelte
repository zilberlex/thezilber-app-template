<script
	lang="ts"
	generics="
		TSurface extends Surface = Surface,
		TFace extends Face = Face,
		TBackFace extends Face = Face
	"
>
	import { componentSurface } from '$lib/engine/ui-infra/composable-renderable/composable-renderable-factories';
	import { renderRenderable } from '$lib/engine/ui-infra/composable-renderable/composable-renderable-renderer.svelte';

	import type {
		AnyRenderable,
		AnyRenderableProps,
		Face,
		Surface
	} from '$lib/engine/ui-infra/composable-renderable/types';

	import ElementSurface from './ElementSurface.svelte';
	import type { Element3DProps } from './types';

	type ResolvedFace = {
		renderable: AnyRenderable;
		renderableProps: AnyRenderableProps;
	};

	const defaultSurface = componentSurface(ElementSurface);

	let {
		rotateX = 0,
		rotateY = 0,
		rotateZ = 0,

		compensateFaceScale = true,

		thisElement = $bindable(),

		surface,
		surfaceProps,

		face,
		faceProps,
		children,

		backFace,
		backFaceProps,

		class: userClass,
		...rest
	}: Element3DProps<TSurface, TFace, TBackFace> = $props();

	const resolvedSurface = $derived((surface ?? defaultSurface) as Surface);

	const resolvedFace: ResolvedFace = $derived.by(() => {
		if (face !== undefined) {
			return {
				renderable: face,
				renderableProps: (faceProps ?? {}) as AnyRenderableProps
			};
		}

		if (children !== undefined) {
			return {
				renderable: children,
				renderableProps: {}
			};
		}

		throw new TypeError('Element3D requires either "face" or children.');
	});

	const resolvedBackFace: ResolvedFace | undefined = $derived.by(() => {
		if (backFace === undefined) {
			if (backFaceProps !== undefined) {
				throw new TypeError('"backFaceProps" requires "backFace".');
			}

			return undefined;
		}

		return {
			renderable: backFace,
			renderableProps: (backFaceProps ?? {}) as AnyRenderableProps
		};
	});

	const resolvedSurfaceProps = $derived.by(() => {
		const props = (surfaceProps ?? {}) as AnyRenderableProps;

		return {
			...props,
			class: ['td-surface', props.class]
		};
	});
</script>

{#snippet faceStack3D()}
	<div class="td-face-stack">
		<div class="td-face td-face--front">
			{@render renderRenderable({
				renderable: resolvedFace.renderable,
				renderableProps: resolvedFace.renderableProps
			})}
		</div>

		{#if resolvedBackFace}
			<div class="td-face td-face--back">
				{@render renderRenderable({
					renderable: resolvedBackFace.renderable,
					renderableProps: resolvedBackFace.renderableProps
				})}
			</div>
		{/if}
	</div>
{/snippet}

<div
	{...rest}
	class={['td-element', userClass]}
	style:--td-rotate-x={`${rotateX}deg`}
	style:--td-rotate-y={`${rotateY}deg`}
	style:--td-rotate-z={`${rotateZ}deg`}
	style:--td-face-scale-compensation={compensateFaceScale ? 1 : 0}
	bind:this={thisElement}
>
	{@render renderRenderable({
		renderable: resolvedSurface,
		renderableProps: resolvedSurfaceProps,
		content: faceStack3D
	})}
</div>
