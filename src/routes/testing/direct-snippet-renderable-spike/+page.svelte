<script lang="ts">
	import type { Snippet } from 'svelte';

	import { componentRenderable } from '$lib/engine/ui-infra/composable-renderable';

	import DirectFaceSite from './DirectFaceSite.svelte';
	import DirectRenderableSite from './DirectRenderableSite.svelte';
	import StatefulProbe from './StatefulProbe.svelte';

	let label = $state('Alpha');
	let count = $state(1);
	let useAlternateSnippet = $state(false);

	const statefulProbeRenderable = componentRenderable(StatefulProbe);
</script>

{#snippet variableWithoutProps()}
	<div>Variable snippet without props</div>
{/snippet}

{#snippet variableWithProps(props: { label: string; count: number })}
	<div>{props.label}: {props.count}</div>
{/snippet}

{#snippet statefulSnippet(props: { label: string })}
	<StatefulProbe label={props.label} />
{/snippet}

{#snippet alternateStatefulSnippet(props: { label: string })}
	<StatefulProbe label={`Alternate ${props.label}`} />
{/snippet}

<svelte:head>
	<title>Direct snippet renderable spike</title>
</svelte:head>

<main>
	<h1>Direct snippet renderable spike</h1>

	<section class="controls">
		<button type="button" onclick={() => (label = label === 'Alpha' ? 'Beta' : 'Alpha')}>
			Update label
		</button>

		<button type="button" onclick={() => count++}>
			Increment props count
		</button>

		<button type="button" onclick={() => (useAlternateSnippet = !useAlternateSnippet)}>
			Switch snippet identity
		</button>
	</section>

	<section>
		<h2>Inline renderable snippet without props</h2>

		<DirectRenderableSite>
			{#snippet renderable()}
				<div>Inline snippet without props</div>
			{/snippet}
		</DirectRenderableSite>
	</section>

	<section>
		<h2>Inline renderable snippet with required props</h2>

		<DirectRenderableSite props={{ label, count }}>
			{#snippet renderable(props: { label: string; count: number })}
				<div>{props.label}: {props.count}</div>
			{/snippet}
		</DirectRenderableSite>
	</section>

	<section>
		<h2>Variable snippets</h2>

		<div class="examples">
			<DirectRenderableSite renderable={variableWithoutProps} />

			<DirectRenderableSite
				renderable={variableWithProps}
				props={{ label, count }}
			/>
		</div>
	</section>

	<section>
		<h2>Inline named face without props</h2>

		<DirectFaceSite>
			{#snippet face()}
				<div>Inline face without props</div>
			{/snippet}
		</DirectFaceSite>
	</section>

	<section>
		<h2>Inline named face with required props</h2>

		<DirectFaceSite faceProps={{ label, count }}>
			{#snippet face(props: { label: string; count: number })}
				<div>{props.label}: {props.count}</div>
			{/snippet}
		</DirectFaceSite>
	</section>

	<section>
		<h2>Prop updates versus identity switching</h2>

		<p>
			Change the local count and input inside the probe. Updating the label must preserve
			both. Switching snippet identity should replace the render site and reset them.
		</p>

		<DirectRenderableSite
			renderable={useAlternateSnippet ? alternateStatefulSnippet : statefulSnippet}
			props={{ label }}
		/>
	</section>

	<section>
		<h2>Injected content</h2>

		<DirectRenderableSite props={{ label }}>
			{#snippet renderable(props: { label: string }, content?: Snippet)}
				<div class="content-wrapper">
					<strong>{props.label}</strong>
					{@render content?.()}
				</div>
			{/snippet}

			{#snippet content()}
				<span>Injected content</span>
			{/snippet}
		</DirectRenderableSite>
	</section>

	<section>
		<h2>Existing descriptor regression case</h2>

		<DirectRenderableSite
			renderable={statefulProbeRenderable}
			props={{ label: `Descriptor ${label}` }}
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 2rem;
		padding: 2rem;
	}

	section {
		display: grid;
		gap: 0.75rem;
	}

	.controls,
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.content-wrapper {
		display: grid;
		gap: 0.5rem;
	}
</style>
