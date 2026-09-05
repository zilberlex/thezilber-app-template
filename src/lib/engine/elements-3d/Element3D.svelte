<script
	lang="ts"
	generics="
		TSurface extends ChildCapableRenderable,
		TFace extends AnyRenderable,
		TBackFace extends AnyRenderable
	"
>
	import { mergeProps } from 'svelte-toolbelt';

	import {
		ComposedComponent,
		componentRenderable,
		type AnyRenderable,
		type ChildCapableRenderable,
		type RenderableProps
	} from '$lib/engine/ui-infra/composable-renderable';

	import ElementSurface from './ElementSurface.svelte';
	import type { Element3DProps } from './types';

	const defaultSurface = componentRenderable(ElementSurface);

	let {
		rotateX = 0,
		rotateY = 0,
		rotateZ = 0,
		depth = 7,
		compensateFaceScale = false,
		thisElement = $bindable(),

		surface,
		surfaceProps,

		face,
		faceProps,
		children,

		backFace,
		backFaceProps,

		class: userClass,
		style: userStyle,
		...rest
	}: Element3DProps<TSurface, TFace, TBackFace> = $props();

	const resolvedSurface = $derived(surface ?? defaultSurface);

	const resolvedSurfaceProps = $derived(
		mergeProps((surfaceProps ?? {}) as RenderableProps, {
			class: 'td-surface'
		})
	);
</script>

{#snippet faceStack()}
	<div class="td-face-stack">
		<div class="td-face td-face--front">
			{#if face}
				<ComposedComponent renderable={face} props={faceProps!} />
			{:else}
				{@render children?.()}
			{/if}
		</div>

		{#if backFace}
			<div class="td-face td-face--back">
				<ComposedComponent renderable={backFace} props={backFaceProps!} />
			</div>
		{/if}
	</div>
{/snippet}

<div
	{...rest}
	bind:this={thisElement}
	class={['td-element', depth < 0 && 'td-element--negative-depth', userClass]}
	style={userStyle}
	style:--td-rotate-x={`${rotateX}deg`}
	style:--td-rotate-y={`${rotateY}deg`}
	style:--td-rotate-z={`${rotateZ}deg`}
	style:--td-depth={`${depth}px`}
	style:--td-face-scale-compensation={compensateFaceScale ? '1' : '0'}
>
	<ComposedComponent renderable={resolvedSurface} props={resolvedSurfaceProps} content={faceStack} />
</div>
