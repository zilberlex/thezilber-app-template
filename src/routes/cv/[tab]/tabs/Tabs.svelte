<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { setTabsContext, type TabDefinition } from './tabs-context';
	import { onNavigate } from '$app/navigation';

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

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="tabs" style:--color={current?.color}>
	{@render children()}

	<nav class="tab-list" aria-label="Sections">
		{#each tabs as tab (tab.id)}
			<a
				href={tab.href}
				aria-current={tab.href === active ? 'page' : undefined}
				style:--color={tab.color}
				style:--ef_change-colors_col1={tab.color}
				style:--ef_change-colors_col2={'var(--cl-on-surface)'}
			>
				{tab.name}
			</a>
		{/each}
	</nav>

	<div class="tab-content">
		<div class="tab-content-inner">
			{@render current?.content()}
		</div>
	</div>
</div>

<style>
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
	}

	.tab-list a {
		--_color: var(--color, var(--cl-primary));
		z-index: 1;

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

		&[aria-current='page'] {
			background: var(--_panel-bg);
			color: inherit;
			border-color: var(--_color);
			transition: none;

			&::after {
				content: '';
				position: absolute;

				left: 0;
				right: 0;
				bottom: calc(-1 * var(--border-thick) - 2px);
				height: calc(var(--border-thick) + 4px);

				background: var(--_panel-bg);
				pointer-events: none;
			}
		}
	}

	.tab-list a:hover {
		text-decoration: none;
	}

	.tab-list a:focus-visible {
		outline: 2px solid var(--_color);
		outline-offset: 3px;
		z-index: 2;
	}

	.tab-content {
		position: relative;
		display: flex;
		flex: 1;
		min-height: 0;

		overflow: hidden;
		padding: var(--space-2);

		border: var(--border-thick) solid var(--_color);
		border-radius: 0 var(--_border-radius) var(--_border-radius) var(--_border-radius);
		background: var(--_panel-bg);
	}

	.tab-content-inner {
		flex: 1;
		min-width: 0;
		min-height: 0;

		overflow: auto;
		scrollbar-gutter: stable;

		view-transition-name: tabs-content;
	}

	:global(::view-transition-group(root)),
	:global(::view-transition-group(tabs-content)) {
		animation: none;
	}

	:global(::view-transition-old(root)) {
		display: none;
	}

	:global(::view-transition-new(root)) {
		animation: none;
	}

	:global(::view-transition-image-pair(tabs-content)) {
		overflow: clip;
	}

	:global(::view-transition-old(tabs-content)) {
		animation: tabs-fade-out 300ms ease-out both;
	}

	:global(::view-transition-new(tabs-content)) {
		animation: tabs-fade-in 300ms ease-out 250ms both;
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
