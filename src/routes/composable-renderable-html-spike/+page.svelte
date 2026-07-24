<script lang="ts">
	import InputSite from './InputSite.svelte';

	let revision = $state(0);

	let directInput = $state<HTMLInputElement>();
	let siteInput = $state<HTMLInputElement>();

	let firstDirectInput: HTMLInputElement | undefined;
	let firstSiteInput: HTMLInputElement | undefined;

	let directNodePreserved = $state(true);
	let siteNodePreserved = $state(true);

	let directFocused = $state(false);
	let siteFocused = $state(false);

	let directValue = $state('');
	let siteValue = $state('');

	const directProps = $derived({
		type: 'text' as const,
		'data-revision': revision
	});

	const siteProps = $derived({
		type: 'text' as const,
		'data-revision': revision
	});

	function replaceProps() {
		firstDirectInput ??= directInput;
		firstSiteInput ??= siteInput;

		revision += 1;

		queueMicrotask(() => {
			const currentDirectInput = directInput;
			const currentSiteInput = siteInput;

			if (!currentDirectInput || !currentSiteInput) return;

			directNodePreserved = currentDirectInput === firstDirectInput;
			siteNodePreserved = currentSiteInput === firstSiteInput;

			directFocused = document.activeElement === currentDirectInput;
			siteFocused = document.activeElement === currentSiteInput;

			directValue = currentDirectInput.value;
			siteValue = currentSiteInput.value;
		});
	}
</script>

<svelte:head>
	<title>HTML site lifecycle spike</title>
</svelte:head>

<main>
	<h1>HTML site lifecycle spike</h1>

	<p>Type different values into both inputs, focus one input, then update the props.</p>

	<button type="button" onmousedown={(event) => event.preventDefault()} onclick={replaceProps}>
		Replace props objects ({revision})
	</button>

	<section>
		<h2>Direct Svelte baseline</h2>

		<p>Rendered revision: {revision}</p>

		<input {...directProps} bind:this={directInput} />

		<dl>
			<dt>Same node</dt>
			<dd>{directNodePreserved}</dd>

			<dt>Still focused</dt>
			<dd>{directFocused}</dd>

			<dt>Current value</dt>
			<dd>{directValue}</dd>
		</dl>
	</section>

	<section>
		<h2>InputSite candidate</h2>

		<p>Rendered revision: {revision}</p>

		<InputSite elementProps={siteProps} bind:element={siteInput} />

		<dl>
			<dt>Same node</dt>
			<dd>{siteNodePreserved}</dd>

			<dt>Still focused</dt>
			<dd>{siteFocused}</dd>

			<dt>Current value</dt>
			<dd>{siteValue}</dd>
		</dl>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1.5rem;
		max-width: 50rem;
		margin: 0 auto;
		padding: 2rem;
	}

	section {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 1rem;
	}

	dt,
	dd,
	p {
		margin: 0;
	}
</style>
