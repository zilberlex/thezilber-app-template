<script lang="ts">
	import DirectBaseline from './DirectBaseline.svelte';
	import ForcedRemountControl from './ForcedRemountControl.svelte';
	import StableSiteCandidate from './StableSiteCandidate.svelte';
	import SwitchableStableSite from './SwitchableStableSite.svelte';
	import TwoStableSites from './TwoStableSites.svelte';

	let sharedRevision = $state(0);
	let siteARevision = $state(0);
	let siteBRevision = $state(0);
	let useAlternate = $state(false);
	let resetKey = $state(0);
</script>

<svelte:head>
	<title>Composable Renderable Lifecycle Spike</title>
</svelte:head>

<main>
	<header class="page-header">
		<div>
			<h1>Composable renderable lifecycle spike</h1>
			<p>Before updating props, increment each local counter and type a distinct value into each input.</p>
		</div>

		<div class="controls">
			<button type="button" onclick={() => (sharedRevision += 1)}>
				Replace shared props objects ({sharedRevision})
			</button>

			<button type="button" onclick={() => (siteARevision += 1)}>
				Update stable site A ({siteARevision})
			</button>

			<button type="button" onclick={() => (siteBRevision += 1)}>
				Update stable site B ({siteBRevision})
			</button>

			<button type="button" onclick={() => (useAlternate = !useAlternate)}>
				Switch component ({useAlternate ? 'alternate' : 'stateful'})
			</button>

			<button type="button" onclick={() => (resetKey += 1)}> Reset all probes </button>
		</div>
	</header>

	{#key resetKey}
		<div class="grid">
			<DirectBaseline label={`shared revision ${sharedRevision}`} />

			<StableSiteCandidate label={`shared revision ${sharedRevision}`} />

			<ForcedRemountControl label={`shared revision ${sharedRevision}`} />
		</div>

		<TwoStableSites labelA={`site A revision ${siteARevision}`} labelB={`site B revision ${siteBRevision}`} />

		<SwitchableStableSite label={`shared revision ${sharedRevision}`} {useAlternate} />
	{/key}
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
	}

	main {
		display: grid;
		gap: 1.5rem;
		max-width: 90rem;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.page-header {
		display: grid;
		gap: 1rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
		gap: 1rem;
	}

	:global(section) {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 0.75rem;
	}

	:global(section h2),
	:global(section h3),
	h1,
	p {
		margin: 0;
	}
</style>
