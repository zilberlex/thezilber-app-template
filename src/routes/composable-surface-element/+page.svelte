<script lang="ts">
	import { componentSurface } from '$lib/engine/ui-infra/composable-renderable/composable-renderable-factories';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import ComposableRenderableDemo from './ComposableRenderableDemo.svelte';

	let redButtonToggle = $state(false);
</script>

{#snippet face()}
	Children Passed as props snippet, surface props passed through the ComposableElement Component
{/snippet}

<main class="ly-center">
	<div class="element-list">
		<ComposableRenderableDemo surface={componentSurface(Button)} surfaceProps={{ class: 'green' }}>
			Children passed as children, surface and surfaceProps passed as props
		</ComposableRenderableDemo>

		<ComposableRenderableDemo surface={componentSurface(Button)} surfaceProps={{ class: 'purple' }}>
			{#snippet face()}
				Surface as Component Prop, face as snippet
			{/snippet}
		</ComposableRenderableDemo>

		<ComposableRenderableDemo surfaceProps={{ class: 'blue' }} {face}>
			{#snippet surface({ content, props })}
				<Button {...props}>{@render content()}</Button>
			{/snippet}
		</ComposableRenderableDemo>

		<ComposableRenderableDemo>
			{#snippet surface({ content })}
				<Button class="red">{@render content()}</Button>
			{/snippet}
			{#snippet face()}
				Surface snippet, children snippet, props from surface definition
			{/snippet}
		</ComposableRenderableDemo>

		<ComposableRenderableDemo surface="div" surfaceProps={{ class: 'styled-element' }}
			>Styled Element</ComposableRenderableDemo
		>

		<ComposableRenderableDemo surface="ul" surfaceProps={{ class: 'styled-list' }}>
			<li>List Item 1</li>
			<li>List Item 2</li>
		</ComposableRenderableDemo>
	</div>
</main>

<style>
	.element-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	:global(.green) {
		color: green;
		border-color: green;
	}

	:global(.blue) {
		color: blue;
		border-color: blue;
	}

	:global(.red) {
		color: red;
		border-color: red;
	}

	:global(.purple) {
		color: purple;
		border-color: purple;
	}

	:global(.styled-element) {
		border: 2px dashed yellow;
		color: yellow;
		padding: 8px 12px;
		text-align: center;
	}

	:global(.styled-list) {
		margin: 0;
		border: 2px dotted cyan;
		color: cyan;
		padding: 8px 12px;
		text-align: center;

		& li {
			list-style-type: none;
		}
	}
</style>
