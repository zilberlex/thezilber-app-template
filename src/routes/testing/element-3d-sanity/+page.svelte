<script lang="ts">
	import { componentRenderable, htmlRenderable, snippetRenderable } from '$lib/engine/ui-infra/composable-renderable';

	import Element3D from '$lib/engine/elements-3d/Element3D.svelte';
	import ElementSurface from '$lib/engine/elements-3d/ElementSurface.svelte';

	import StatefulFace from './StatefulFace.svelte';

	const buttonFace = htmlRenderable('button');
	const divBackFace = htmlRenderable('div');
	const statefulFace = componentRenderable(StatefulFace);
	const customSurface = componentRenderable(ElementSurface);

	let rotateX = $state(20);

	let rotateY = $state(30);
	let rotateZ = $state(0);
	let depth = $state(8);

	let label = $state('Stateful face');
	let useCustomSurface = $state(false);
</script>

{#snippet snippetFace(props: { label: string })}
	<div class="face-content">
		{props.label}
	</div>
{/snippet}

<main>
	<div class="controls">
		<label>
			Rotate X
			<input type="range" min="-180" max="180" bind:value={rotateX} />
		</label>

		<label>
			Rotate Y
			<input type="range" min="-180" max="180" bind:value={rotateY} />
		</label>

		<label>
			Rotate Z
			<input type="range" min="-180" max="180" bind:value={rotateZ} />
		</label>

		<label>
			Depth
			<input type="range" min="-20" max="20" bind:value={depth} />
		</label>

		<button type="button" onclick={() => (label += '!')}> Update face props </button>

		<button type="button" onclick={() => (useCustomSurface = !useCustomSurface)}> Toggle explicit surface </button>
	</div>

	<section>
		<h2>Direct children</h2>

		<Element3D {depth} {rotateX} {rotateY} {rotateZ}>
			<div class="face-content">Direct children face</div>
		</Element3D>
	</section>

	<section>
		<h2>HTML face and back face</h2>

		<Element3D
			{rotateX}
			{rotateY}
			{rotateZ}
			{depth}
			face={buttonFace}
			faceProps={{
				type: 'button',
				class: 'face-content'
			}}
			backFace={divBackFace}
			backFaceProps={{
				class: 'face-content'
			}}
		/>
	</section>

	<section>
		<h2>Snippet face</h2>

		<Element3D
			{rotateX}
			{rotateY}
			{rotateZ}
			{depth}
			face={snippetRenderable(snippetFace)}
			faceProps={{
				label: 'Snippet face'
			}}
		/>
	</section>

	<section>
		<h2>Stateful component face</h2>

		{#if useCustomSurface}
			<Element3D
				{rotateX}
				{rotateY}
				{rotateZ}
				{depth}
				surface={customSurface}
				surfaceProps={{
					'data-custom-surface': true
				}}
				face={statefulFace}
				faceProps={{ label }}
			/>
		{:else}
			<Element3D {depth} {rotateX} {rotateY} {rotateZ} face={statefulFace} faceProps={{ label }} />
		{/if}
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 2rem;
		padding: 2rem;
	}

	.controls {
		display: grid;
		gap: 0.75rem;
		max-width: 28rem;
	}

	label {
		display: grid;
		gap: 0.25rem;
	}

	section {
		display: grid;
		gap: 1rem;
		justify-items: start;
	}

	.face-content,
	:global(.face-content) {
		padding: 1rem 1.25rem;
		border: 1px solid currentColor;
		border-radius: 0.75rem;
	}
</style>
