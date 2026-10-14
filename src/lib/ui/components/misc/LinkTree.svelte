<script lang="ts">
	import { base, resolve } from '$app/paths';

	type Section = {
		name: string;
		url?: string;
		children: Section[];
	};

	const { urls }: { urls: readonly string[] } = $props();

	function breakDownUrls(urls: readonly string[]): Section[] {
		const root: Section[] = [];

		for (const url of urls) {
			const parts = url.split('/').filter(Boolean);

			if (!parts.length) {
				if (!root.some((s) => s.name === '/')) {
					root.push({ name: '/', url, children: [] });
				}
				continue;
			}

			let level = root;

			for (const [index, part] of parts.entries()) {
				let section = level.find((s) => s.name === part);

				if (!section) {
					section = { name: part, children: [] };
					level.push(section);
				}

				if (index === parts.length - 1) {
					section.url = url;
				}

				level = section.children;
			}
		}

		sortSections(root);

		return root;
	}

	function sortSections(sections: Section[]) {
		sections.forEach((section) => {
			sortSections(section.children);
		});

		sections.sort((a, b) => (b.url ? 1 : -1));
	}

	const sections = $derived(breakDownUrls(urls));
</script>

{#snippet renderSections(items: Section[])}
	<ul>
		{#each items as section (section.name)}
			<li>
				{#if section.children.length}
					<details>
						<summary>{section.name}</summary>

						{#if section.url}
							<a class="section-link" href="{base}{section.url}"> Overview </a>
						{/if}

						{@render renderSections(section.children)}
					</details>
				{:else if section.url}
					<a href={resolve(section.url)}>{section.name}</a>
				{:else}
					<span>{section.name}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<nav class="link-tree" aria-label="Site routes">
	{@render renderSections(sections)}
</nav>

<style>
	.link-tree {
		font-size: var(--font-size-3);
	}

	ul {
		list-style: none;
		margin: 0;
		padding-left: 1.25rem;
	}
</style>
