<script lang="ts">
	import type { Snippet } from 'svelte';

	import AlternateSnippetChild from './AlternateSnippetChild.svelte';
	import ProbeMetrics from './ProbeMetrics.svelte';
	import SnippetSite from './SnippetSite.svelte';
	import StatefulSnippetChild from './StatefulSnippetChild.svelte';

	import type { ProbeSnippet, SnippetProbeProps } from './probe-types';

	let revision = $state(0);
	let useAlternate = $state(false);
	let resetKey = $state(0);

	let directMounts = $state(0);
	let directDestroys = $state(0);
	let directFirstRoot: HTMLElement | undefined;
	let directRootPreserved = $state(true);
	let directInternalValue = $state<number>();
	let directInputValue = $state<string>();

	let siteMounts = $state(0);
	let siteDestroys = $state(0);
	let siteFirstRoot: HTMLElement | undefined;
	let siteRootPreserved = $state(true);
	let siteInternalValue = $state<number>();
	let siteInputValue = $state<string>();

	function directMount(root: HTMLElement) {
		directMounts += 1;
		directFirstRoot ??= root;
		directRootPreserved = directFirstRoot === root;
	}

	function siteMount(root: HTMLElement) {
		siteMounts += 1;
		siteFirstRoot ??= root;
		siteRootPreserved = siteFirstRoot === root;
	}

	function replacePropsObjects() {
		revision += 1;
	}

	function switchSnippet() {
		useAlternate = !useAlternate;
	}

	function resetProbes() {
		revision = 0;
		useAlternate = false;

		directMounts = 0;
		directDestroys = 0;
		directFirstRoot = undefined;
		directRootPreserved = true;
		directInternalValue = undefined;
		directInputValue = undefined;

		siteMounts = 0;
		siteDestroys = 0;
		siteFirstRoot = undefined;
		siteRootPreserved = true;
		siteInternalValue = undefined;
		siteInputValue = undefined;

		resetKey += 1;
	}

	const directProps = $derived<SnippetProbeProps>({
		siteId: 'direct-snippet',
		label: `revision ${revision}`,
		onMountProbe: directMount,
		onDestroyProbe: () => {
			directDestroys += 1;
		},
		onInternalChange: (value) => {
			directInternalValue = value;
		},
		onInputChange: (value) => {
			directInputValue = value;
		}
	});

	const siteProps = $derived<SnippetProbeProps>({
		siteId: 'snippet-site',
		label: `revision ${revision}`,
		onMountProbe: siteMount,
		onDestroyProbe: () => {
			siteDestroys += 1;
		},
		onInternalChange: (value) => {
			siteInternalValue = value;
		},
		onInputChange: (value) => {
			siteInputValue = value;
		}
	});
</script>

{#snippet statefulSnippet(props: SnippetProbeProps, content: Snippet)}
	<StatefulSnippetChild {...props} {content} />
{/snippet}

{#snippet alternateSnippet(props: SnippetProbeProps, content: Snippet)}
	<AlternateSnippetChild {...props} {content} />
{/snippet}

{#snippet directContent()}
	<strong>Direct injected content</strong>
{/snippet}

{#snippet siteContent()}
	<strong>SnippetSite injected content</strong>
{/snippet}

<svelte:head>
	<title>Snippet site lifecycle spike</title>
</svelte:head>

<main>
	<header>
		<div>
			<h1>Snippet site lifecycle spike</h1>

			<p>
				Increment both local counters and type distinct values into both inputs before replacing props or switching the
				snippet.
			</p>
		</div>

		<div class="controls">
			<button type="button" onclick={replacePropsObjects}>
				Replace props objects ({revision})
			</button>

			<button type="button" onclick={switchSnippet}>
				Switch snippet ({useAlternate ? 'alternate' : 'stateful'})
			</button>

			<button type="button" onclick={resetProbes}> Reset probes </button>
		</div>
	</header>

	{#key resetKey}
		<div class="grid">
			<section>
				<h2>Direct snippet baseline</h2>

				<p>
					Native rendering with
					<code>selectedSnippet(directProps, directContent)</code>.
				</p>

				<ProbeMetrics
					mounts={directMounts}
					destroys={directDestroys}
					rootPreserved={directRootPreserved}
					internalValue={directInternalValue}
					inputValue={directInputValue}
				/>

				{#if useAlternate}
					{@render alternateSnippet(directProps, directContent)}
				{:else}
					{@render statefulSnippet(directProps, directContent)}
				{/if}
			</section>

			<section>
				<h2>SnippetSite candidate</h2>

				<p>The same typed snippet rendered through a dedicated site component.</p>

				<ProbeMetrics
					mounts={siteMounts}
					destroys={siteDestroys}
					rootPreserved={siteRootPreserved}
					internalValue={siteInternalValue}
					inputValue={siteInputValue}
				/>

				{#if useAlternate}
					<SnippetSite snippet={alternateSnippet} snippetProps={siteProps} content={siteContent} />
				{:else}
					<SnippetSite snippet={statefulSnippet} snippetProps={siteProps} content={siteContent} />
				{/if}
			</section>
		</div>
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

	header {
		display: grid;
		gap: 1rem;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
		gap: 1rem;
	}

	section {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 0.75rem;
	}

	code {
		font-family: ui-monospace, monospace;
	}
</style>
