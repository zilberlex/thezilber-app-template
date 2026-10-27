<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { setTabsContext, type TabDefinition } from './tabs-context';
	import { page } from '$app/state';
	import { getBasePath, getContextPath } from '$lib/engine/routing/routing-helps';

	let { children }: { children: Snippet } = $props();

	let tabs = $state<TabDefinition[]>([]);
	const tabUrl = (key: string) => getContextPath(getBasePath('[[tab]]'), key).pathname;
	let activeId = $derived(tabs.find((tab) => tabUrl(tab.href) === page.url.pathname)?.id ?? tabs[0]?.id ?? null);

	let activeTab1 = $state<TabDefinition>();
	let activeTab2 = $state<TabDefinition>();
	let foregroundTabToggle = $state(false);
	let currentTab = $derived(foregroundTabToggle ? activeTab1 : activeTab2);

	$effect(() => {
		if (activeId) {
			untrack(() => {
				const newActiveTab = tabs.find((tab) => tab.id === activeId);

				foregroundTabToggle = !foregroundTabToggle;

				if (foregroundTabToggle) {
					activeTab1 = newActiveTab;
					console.log('new active tab1', {
						activeTab1,
						foregroundTabToggle
					});
				} else {
					activeTab2 = newActiveTab;
					console.log('new active tab2', { activeTab2, foregroundTabToggle });
				}
			});
		}
	});

	const uid = $props.id();

	setTabsContext({
		register(tab) {
			tabs.push(tab);

			return () => {
				tabs = tabs.filter((item) => item.id !== tab.id);
			};
		}
	});
</script>

<div class="tabs" style:--color={currentTab?.color}>
	<div class="tab-list" role="tablist">
		{#each tabs as tab, i (tab.id)}
			<a
				href={tabUrl(tab.href)}
				aria-current={activeId === tab.id ? 'page' : undefined}
				style:--color={tab.color}
				style:--ef_change-colors_col1={tab.color}
				style:--ef_change-colors_col2={'var(--cl-on-surface)'}
				data-active={currentTab?.id === tab.id ? '' : null}
			>
				{tab.name}
			</a>
		{/each}
	</div>

	<div
		class="tab-content"
		role="tabpanel"
		id="{uid}-panel"
		aria-labelledby={currentTab ? `${uid}-tab-${tabs.indexOf(currentTab)}` : undefined}
		tabindex="0"
	>
		{#if activeTab1}
			<div
				class="active-tab active-tab-1"
				data-active={foregroundTabToggle ? '' : null}
				style:--color={activeTab1.color}
			>
				{@render activeTab1.content()}
			</div>
			<div
				class="active-tab active-tab-2"
				data-active={!foregroundTabToggle ? '' : null}
				style:--color={activeTab2?.color}
			>
				{@render activeTab2?.content()}
			</div>
		{/if}
	</div>

	<div class="registrations">
		{@render children()}
	</div>
</div>

<style>
	.tabs {
		--_color: var(--color, var(--cl-primary));
		--_border-radius: 0.5rem;
		--_panel-bg: var(--color_bg, var(--cl-background));

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
		&,
		&::before,
		&::after {
			all: unset;
		}

		&:is(:hover) {
			text-decoration: none;
		}

		position: relative;

		border: var(--border-thick) solid var(--color);
		border-bottom: none;
		border-radius: var(--_border-radius) var(--_border-radius) 0 0;

		padding: var(--space-1) var(--space-3);
		background: transparent;

		cursor: pointer;

		color: color-mix(in srgb, currentColor 60%, transparent);
		border-color: color-mix(in srgb, var(--_color) 60%, transparent);

		transition:
			color 400ms,
			border-color 400ms;

		&[data-active] {
			color: inherit;
			border-color: var(--color);
			transition: none;

			&::after {
				content: '';
				position: absolute;
				left: 0;
				right: 0;
				bottom: calc(-1 * var(--border-thick));
				height: var(--border-thick);
				background: black;
				transition: none;
			}
		}
	}

	.tab-content {
		outline: none;
		scrollbar-gutter: stable;
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: var(--space-4);
		border: var(--border-thick) solid var(--_color);
		border-radius: 0 var(--_border-radius) var(--_border-radius) var(--_border-radius);

		& .active-tab {
			position: absolute;
			inset: var(--space-2);
			display: none;
			opacity: 0;

			&[data-active] {
				display: revert;
				opacity: 1;

				transition-delay: 250ms;

				@starting-style {
					& {
						opacity: 0;
					}
				}
			}

			transition:
				display 300ms allow-discrete,
				opacity 300ms ease-out;
		}
	}

	.registrations {
		display: none;
	}
</style>
