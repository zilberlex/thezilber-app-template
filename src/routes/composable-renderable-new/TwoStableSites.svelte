<script lang="ts">
	import ComponentSite from './ComponentSite.svelte';
	import ProbeMetrics from './ProbeMetrics.svelte';
	import StatefulChild from './StatefulChild.svelte';
	import type { ProbeProps } from './probe-types';

	let {
		labelA,
		labelB
	}: {
		labelA: string;
		labelB: string;
	} = $props();

	let mountsA = $state(0);
	let destroysA = $state(0);
	let firstRootA: HTMLElement | undefined;
	let rootPreservedA = $state(true);
	let internalValueA = $state<number>();
	let inputValueA = $state<string>();

	let mountsB = $state(0);
	let destroysB = $state(0);
	let firstRootB: HTMLElement | undefined;
	let rootPreservedB = $state(true);
	let internalValueB = $state<number>();
	let inputValueB = $state<string>();

	function onMountProbeA(root: HTMLElement) {
		mountsA += 1;
		firstRootA ??= root;
		rootPreservedA = firstRootA === root;
	}

	function onMountProbeB(root: HTMLElement) {
		mountsB += 1;
		firstRootB ??= root;
		rootPreservedB = firstRootB === root;
	}

	const propsA = $derived<ProbeProps>({
		siteId: 'stable-a',
		label: labelA,
		onMountProbe: onMountProbeA,
		onDestroyProbe: () => (destroysA += 1),
		onInternalChange: (value) => (internalValueA = value),
		onInputChange: (value) => (inputValueA = value)
	});

	const propsB = $derived<ProbeProps>({
		siteId: 'stable-b',
		label: labelB,
		onMountProbe: onMountProbeB,
		onDestroyProbe: () => (destroysB += 1),
		onInternalChange: (value) => (internalValueB = value),
		onInputChange: (value) => (inputValueB = value)
	});
</script>

<section>
	<h2>Two component sites using the same component</h2>

	<p>Updating A or B must not alter the other site's state, input, root, or lifecycle counts.</p>

	<div class="sites">
		<div>
			<h3>Site A</h3>

			<ProbeMetrics
				mounts={mountsA}
				destroys={destroysA}
				rootPreserved={rootPreservedA}
				internalValue={internalValueA}
				inputValue={inputValueA}
			/>

			<ComponentSite component={StatefulChild} componentProps={propsA} />
		</div>

		<div>
			<h3>Site B</h3>

			<ProbeMetrics
				mounts={mountsB}
				destroys={destroysB}
				rootPreserved={rootPreservedB}
				internalValue={internalValueB}
				inputValue={inputValueB}
			/>

			<ComponentSite component={StatefulChild} componentProps={propsB} />
		</div>
	</div>
</section>

<style>
	.sites {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 1rem;
	}
</style>
