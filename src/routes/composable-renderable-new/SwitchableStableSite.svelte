<script lang="ts">
	import type { Component } from 'svelte';
	import AlternateChild from './AlternateChild.svelte';
	import ComponentSite from './ComponentSite.svelte';
	import ProbeMetrics from './ProbeMetrics.svelte';
	import StatefulChild from './StatefulChild.svelte';
	import type { ProbeProps } from './probe-types';

	let {
		label,
		useAlternate
	}: {
		label: string;
		useAlternate: boolean;
	} = $props();

	let mounts = $state(0);
	let destroys = $state(0);
	let currentRoot: HTMLElement | undefined;
	let previousRoot: HTMLElement | undefined;
	let rootPreserved = $state(true);
	let internalValue = $state<number>();
	let inputValue = $state<string>();

	function onMountProbe(root: HTMLElement) {
		mounts += 1;

		if (previousRoot) {
			rootPreserved = previousRoot === root;
		}

		currentRoot = root;
		previousRoot = root;
	}

	function onDestroyProbe() {
		destroys += 1;
		currentRoot = undefined;
	}

	const selectedComponent = $derived((useAlternate ? AlternateChild : StatefulChild) as Component<ProbeProps>);

	const childProps = $derived<ProbeProps>({
		siteId: 'switchable',
		label,
		onMountProbe,
		onDestroyProbe,
		onInternalChange: (value) => (internalValue = value),
		onInputChange: (value) => (inputValue = value)
	});
</script>

<section>
	<h2>Component site with renderable replacement</h2>

	<p>Props updates must preserve the instance. Switching the component must destroy once and mount once.</p>

	<ProbeMetrics {mounts} {destroys} {rootPreserved} {internalValue} {inputValue} />

	<ComponentSite component={selectedComponent} componentProps={childProps} />
</section>
