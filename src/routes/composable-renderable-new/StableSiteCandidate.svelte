<script lang="ts">
	import ComponentSite from './ComponentSite.svelte';
	import ProbeMetrics from './ProbeMetrics.svelte';
	import StatefulChild from './StatefulChild.svelte';
	import type { ProbeProps } from './probe-types';

	let { label }: { label: string } = $props();

	let mounts = $state(0);
	let destroys = $state(0);
	let firstRoot: HTMLElement | undefined;
	let rootPreserved = $state(true);
	let internalValue = $state<number>();
	let inputValue = $state<string>();

	function onMountProbe(root: HTMLElement) {
		mounts += 1;
		firstRoot ??= root;
		rootPreserved = firstRoot === root;
	}

	function onDestroyProbe() {
		destroys += 1;
	}

	const childProps = $derived<ProbeProps>({
		siteId: 'stable-site',
		label,
		onMountProbe,
		onDestroyProbe,
		onInternalChange: (value) => (internalValue = value),
		onInputChange: (value) => (inputValue = value)
	});
</script>

<section>
	<h2>Component-site candidate</h2>

	<ProbeMetrics {mounts} {destroys} {rootPreserved} {internalValue} {inputValue} />

	<ComponentSite component={StatefulChild} componentProps={childProps} />
</section>
