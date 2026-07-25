<script lang="ts">
	import { componentRenderable, htmlRenderable, snippetRenderable } from '$lib/engine/ui-infra/composable-renderable';

	import Element3D from '$lib/engine/elements-3d/Element3D.svelte';

	import StatefulFace from './StatefulFace.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';

	const visibleSurface = htmlRenderable('div');
	const statefulFace = componentRenderable(StatefulFace);

	let rotateX = $state(20);
	let rotateY = $state(-25);
	let rotateZ = $state(0);
	let depth = $state(14);

	let buttonSurfaceState = $state(0);

	let compensateFaceScale = $state(true);
	let label = $state('Stateful face');
</script>

{#snippet frontFace(props: { label: string })}
	<div class="face-content">
		{props.label}
	</div>
{/snippet}

{#snippet backFace()}
	<div class="face-content">Back face</div>
{/snippet}

<main>
	<section class="controls">
		<h1>Element3D sanity</h1>

		<label>
			<span>Rotate X: {rotateX}°</span>
			<input type="range" min="-180" max="180" step="1" bind:value={rotateX} />
		</label>

		<label>
			<span>Rotate Y: {rotateY}°</span>
			<input type="range" min="-180" max="180" step="1" bind:value={rotateY} />
		</label>

		<label>
			<span>Rotate Z: {rotateZ}°</span>
			<input type="range" min="-180" max="180" step="1" bind:value={rotateZ} />
		</label>

		<label>
			<span>Depth: {depth}px</span>
			<input type="range" min="0" max="50" step="1" bind:value={depth} />
		</label>

		<label class="checkbox">
			<input type="checkbox" bind:checked={compensateFaceScale} />

			<span>Compensate face scale</span>
		</label>

		<button type="button" onclick={() => (label += '!')}> Update component props </button>
	</section>

	<section class="examples">
		<article>
			<h2>Button component surface with direct children</h2>

			<div class="preview">
				<Element3D
					surface={componentRenderable(Button)}
					surfaceProps={{ onclick: () => buttonSurfaceState++ }}
					{rotateX}
					{rotateY}
					{rotateZ}
					{depth}
					{compensateFaceScale}
				>
					Button Clicks: {buttonSurfaceState}
				</Element3D>
			</div>
		</article>
		<article>
			<h2>Direct children face</h2>

			<div class="preview">
				<Element3D
					surface={visibleSurface}
					surfaceProps={{
						class: 'sanity-surface'
					}}
					{rotateX}
					{rotateY}
					{rotateZ}
					{depth}
					{compensateFaceScale}
				>
					Button-like surface
				</Element3D>
			</div>
		</article>

		<article>
			<h2>Snippet front and back faces</h2>

			<div class="preview">
				<Element3D
					surface={visibleSurface}
					surfaceProps={{
						class: 'sanity-surface'
					}}
					{rotateX}
					{rotateY}
					{rotateZ}
					{depth}
					{compensateFaceScale}
					face={snippetRenderable(frontFace)}
					faceProps={{
						label: 'Front face'
					}}
					backFace={snippetRenderable(backFace)}
					backFaceProps={{}}
				/>
			</div>
		</article>

		<article>
			<h2>Stateful component face</h2>

			<div class="preview">
				<Element3D
					surface={visibleSurface}
					surfaceProps={{
						class: 'sanity-surface'
					}}
					{rotateX}
					{rotateY}
					{rotateZ}
					{depth}
					{compensateFaceScale}
					face={statefulFace}
					faceProps={{ label }}
				/>
			</div>
		</article>
	</section>
</main>

<style>
	main {
		isolation: isolate;

		display: grid;
		grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
		gap: 3rem;

		min-block-size: 100vh;
		padding: 2rem;
	}

	.controls {
		position: relative;
		z-index: 1;

		align-self: start;

		display: grid;
		gap: 1rem;

		padding: 1.25rem;
		border: 1px solid currentColor;
		border-radius: 0.75rem;
	}

	.controls label {
		display: grid;
		gap: 0.4rem;
	}

	.controls input[type='range'] {
		inline-size: 100%;
	}

	.controls .checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.examples {
		display: grid;
		gap: 3rem;
	}

	article {
		display: grid;
		gap: 1rem;

		min-block-size: 12rem;
	}

	.preview {
		display: grid;
		place-items: center;

		min-block-size: 12rem;
		padding: 4rem;

		border: 1px dashed currentColor;
		border-radius: 0.75rem;
	}

	:global(.sanity-surface) {
		display: inline-grid;

		border: 2px solid currentColor;
		border-radius: 0.6rem;

		transform-style: preserve-3d;
	}

	.face-content {
		display: grid;
		place-items: center;

		min-inline-size: 10rem;
		min-block-size: 4rem;

		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
	}

	@media (max-width: 800px) {
		main {
			grid-template-columns: 1fr;
		}
	}
</style>
