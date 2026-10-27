<script lang="ts">
	import AboutPageRevised from './pages/AboutPageRevised.svelte';
	import CSharpPage from './pages/csharp/CSharpPage.svelte';
	import SveltePageRefined from './pages/svelte-refined/SveltePageRefined.svelte';
	import Tab from './tabs/Tab.svelte';
	import Tabs from './tabs/Tabs.svelte';
</script>

<div class="cv-panel">
	<Tabs>
		<Tab name="About" color="#02b6f2" href="about">
			<AboutPageRevised />
		</Tab>
		<Tab name="Svelte" color="#ff3e00" href="svelte">
			<SveltePageRefined />
		</Tab>
		<Tab name="C#" color="#9b7bff" href="c-sharp">
			<CSharpPage />
		</Tab>
	</Tabs>
</div>

<style>
	.cv-panel {
		height: calc(100% - var(--space-4) * 2);
		margin: var(--space-4);
	}
</style>
