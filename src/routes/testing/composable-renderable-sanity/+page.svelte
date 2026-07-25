<script lang="ts">
	import {
		ComposedComponent,
		componentRenderable,
		htmlRenderable,
		snippetRenderable
	} from '$lib/engine/ui-infra/composable-renderable';

	import TestComponent from './TestComponent.svelte';

	const buttonRenderable = htmlRenderable('button');
	const divRenderable = htmlRenderable('div');
	const inputRenderable = htmlRenderable('input');
	const componentRenderableValue = componentRenderable(TestComponent);

	let label = $state('Component');
	let useButton = $state(false);
</script>

{#snippet testSnippet(props: { label: string })}
	<strong>{props.label}</strong>
{/snippet}

{#snippet injectedContent()}
	<span>Injected content</span>
{/snippet}

<main>
	<button type="button" onclick={() => (label += '!')}> Update props </button>

	<button type="button" onclick={() => (useButton = !useButton)}> Switch HTML identity </button>

	<section>
		<h2>HTML</h2>

		{#if useButton}
			<ComposedComponent
				renderable={buttonRenderable}
				props={{
					type: 'button',
					class: 'html-renderable'
				}}
				content={injectedContent}
			/>
		{:else}
			<ComposedComponent
				renderable={divRenderable}
				props={{
					class: 'html-renderable'
				}}
				content={injectedContent}
			/>
		{/if}
	</section>

	<section>
		<h2>Component</h2>

		<ComposedComponent renderable={componentRenderableValue} props={{ label }} content={injectedContent} />
	</section>

	<section>
		<h2>Snippet</h2>

		<ComposedComponent renderable={snippetRenderable(testSnippet)} props={{ label }} content={injectedContent} />
	</section>

	<section>
		<h2>Void HTML</h2>

		<ComposedComponent
			renderable={inputRenderable}
			props={{
				placeholder: 'Void renderable'
			}}
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1.5rem;
		padding: 2rem;
	}

	section {
		display: grid;
		gap: 0.5rem;
	}
</style>
