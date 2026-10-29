<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { setTabsContext, type TabDefinition } from './tabs-context';

	let { children }: { children: Snippet } = $props();

	let tabs = $state<TabDefinition[]>([]);

	let active = $derived(page.url.pathname.split('/').filter(Boolean).at(-1));
	let current = $derived(tabs.find((tab) => tab.href === active));

	setTabsContext({
		register(tab) {
			tabs.push(tab);

			return () => {
				tabs = tabs.filter((item) => item.id !== tab.id);
			};
		}
	});
</script>

<div class="tabs" style:--color={current?.color}>
	{@render children()}

	<nav class="tab-list" aria-label="Sections" data-sveltekit-reload>
		{#each tabs as tab (tab.id)}
			<a href={tab.href} aria-current={tab.href === active ? 'page' : undefined} style:--color={tab.color}>
				{tab.name}
			</a>
		{/each}
	</nav>

	<div class="tab-content">
		{@render current?.content()}
	</div>
</div>

<style>
	@view-transition {
		navigation: auto;
	}

	.tabs {
		--_color: var(--color, var(--cl-primary));
		--_border-radius: 0.5rem;
		--_panel-bg: var(--color_bg, var(--cl-background, black));

		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.tab-list {
		display: flex;
		position: relative;
		z-index: 1;
		flex: none;

		view-transition-name: tabs-navigation;
	}

	.tab-list a {
		--_color: var(--color, var(--cl-primary));

		position: relative;
		display: block;

		border: var(--border-thick) solid var(--_color);
		border-bottom: none;
		border-radius: var(--_border-radius) var(--_border-radius) 0 0;

		padding: var(--space-1) var(--space-3);
		background: transparent;

		font: inherit;
		text-decoration: none;
		cursor: pointer;

		color: color-mix(in srgb, currentColor 60%, transparent);
		border-color: color-mix(in srgb, var(--_color) 60%, transparent);

		transition:
			color 400ms,
			border-color 400ms;
	}

	.tab-list a:hover {
		text-decoration: none;
	}

	.tab-list a[aria-current='page'] {
		color: inherit;
		border-color: var(--_color);
		transition: none;
	}

	.tab-list a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(-1 * var(--border-thick));
		height: var(--border-thick);
		background: var(--_panel-bg);
	}

	.tab-list a:focus-visible {
		outline: 2px solid var(--_color);
		outline-offset: 3px;
		z-index: 2;
	}

	.tab-content {
		position: relative;
		flex: 1;
		min-height: 0;

		overflow: auto;
		scrollbar-gutter: stable;

		padding: var(--space-2);
		border: var(--border-thick) solid var(--_color);
		border-radius: 0 var(--_border-radius) var(--_border-radius) var(--_border-radius);
		background: var(--_panel-bg);

		view-transition-name: tabs-content;
	}

	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
	}

	:global(::view-transition-old(tabs-content)) {
		animation: 250ms ease-out both tabs-fade-out;
	}

	:global(::view-transition-new(tabs-content)) {
		animation: 300ms 150ms ease-in both tabs-fade-in;
	}

	@keyframes -global-tabs-fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes -global-tabs-fade-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(tabs-content)),
		:global(::view-transition-new(tabs-content)) {
			animation: none;
		}
	}
</style>
