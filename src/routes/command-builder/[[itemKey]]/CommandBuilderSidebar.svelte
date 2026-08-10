<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { CbAppEnv } from './command-builder-types';
	import CommandBuilderSiderbarItem from './CommandBuilderSiderbarItem.svelte';
	import type { CollectionAppRecordProjection } from '$lib/app-infrastructure/collection-app/data/types';
	import { getFirstFocusable } from '$lib/engine/keyboard-navigation/navigation-utils';

	let { cbAppEnv, ...rest }: { cbAppEnv: CbAppEnv } = $props();

	let menuLabel: HTMLHeadingElement;
	let labelHeight = $state(0);
	let resizeObserver: ResizeObserver;

	let currentlySelectedItemSlug = $state<string>();
	let thisElement = $state<HTMLElement>();

	let cbRecordProjections = $derived.by(() => {
		let proj = cbAppEnv.allRecordProjections;
		proj.size;
		return proj.toValueArray();
	});

	onMount(() => {
		const updateLabelHeight = () => {
			labelHeight = menuLabel?.offsetHeight ?? 0;
		};

		updateLabelHeight();

		resizeObserver = new ResizeObserver(updateLabelHeight);
		if (menuLabel) {
			resizeObserver.observe(menuLabel);
		}
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	async function afterDelete(node: HTMLElement) {
		let nextIndexAttribute = node.getAttribute('data-item-list-index');
		if (!nextIndexAttribute) {
			console.warn('NO data-item-list-index on node', node);
		}

		focusNext(Number(nextIndexAttribute));
	}

	function selectItem(item: CollectionAppRecordProjection<any, any>) {
		currentlySelectedItemSlug = item.slug;
	}

	function unselectItem(item: CollectionAppRecordProjection<any, any>) {
		if (currentlySelectedItemSlug === item.slug) currentlySelectedItemSlug = undefined;
	}

	function isNonInertElement(el: HTMLElement): boolean {
		return !el.inert && !el.closest('[inert]');
	}

	function getItemIndex(el: HTMLElement): number {
		return Number(el.dataset.itemListIndex);
	}

	function focusNext(index: number) {
		const itemElements = Array.from(thisElement?.querySelectorAll<HTMLElement>('[data-item-list-index]') ?? []).filter(
			isNonInertElement
		);

		// Gets the closest element. in svelte indexing via attribute is instant change -> if you index by attribute - the list is updated straight away, but the original item also maintains its original index
		const nextElem =
			itemElements.find((el) => getItemIndex(el) >= index) ?? itemElements.findLast((el) => getItemIndex(el) < index);

		if (nextElem) {
			const nextFocusable = getFirstFocusable(nextElem);
			nextFocusable?.focus();
		}
	}
</script>

<nav
	class="command-builder-sidebar"
	style:--section-label-height={`${labelHeight}px`}
	bind:this={thisElement}
	{...rest}
>
	<section class="sidebar-section">
		<h2 bind:this={menuLabel} class="menu-label">Saved Commands:</h2>

		{#each cbRecordProjections as item, i (item.recordId)}
			<CommandBuilderSiderbarItem
				onmouseenter={() => selectItem(item)}
				onfocusin={() => selectItem(item)}
				onfocusout={() => unselectItem(item)}
				onmouseleave={() => unselectItem(item)}
				{afterDelete}
				{cbAppEnv}
				recordProjection={item}
				{currentlySelectedItemSlug}
				data-item-list-index={i}
			/>
		{/each}
	</section>
</nav>

<style>
	.command-builder-sidebar {
		display: flex;
		flex-direction: column;

		& > * {
			width: 100%;
		}
	}

	.menu-label {
		color: var(--cl-on-surface-dimmer);
		padding: var(--space-3) var(--space-2);
		font-size: var(--font-size-3);
		font-weight: normal;
		width: var(--sidebar-item-width);

		position: sticky;
		top: 0;
		z-index: 1;
		background-color: var(--cl-surface);

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-section {
		display: flex;
		flex-direction: column;
	}
</style>
