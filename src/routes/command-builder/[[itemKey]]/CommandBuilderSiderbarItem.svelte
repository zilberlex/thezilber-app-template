<script lang="ts">
	import DeleteIcon from '$lib/assets/icons/DeleteIcon.svelte';
	import EditIcon from '$lib/assets/icons/EditIcon.svelte';
	import IconButton from '$lib/ui/basic-components/IconButton.svelte';
	import InlineNameEditor, { type EditDetail } from '$lib/ui/components/InlineNameEditor.svelte';
	import type { CbAppEnv, CbRecordProjection } from './command-builder-types';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { tick } from 'svelte';
	import { fadeAndSlide } from '$lib/engine/transitions/fade-and-slide';

	type Props = HTMLAttributes<HTMLDivElement> & {
		cbAppEnv: CbAppEnv;
		recordProjection: CbRecordProjection;
		currentlySelectedItemSlug?: string;
		afterDelete: (node: HTMLElement) => Promise<void>;
	};

	let { cbAppEnv, recordProjection, currentlySelectedItemSlug, afterDelete, ...rest }: Props = $props();

	let editingName = $state(false);
	const isElementPageForThisItem = $derived(recordProjection.slug === cbAppEnv.slug);
	const showControls = $derived(currentlySelectedItemSlug === recordProjection.slug);
	let thisFocusablePart = $state<HTMLElement>();
	let thisElement = $state<HTMLElement>();

	function editItemName() {
		editingName = true;
	}

	$effect(() => {
		if (!editingName) {
			console.debug('Exiting Edit. Focusable item:', thisFocusablePart);

			// TODO AZ this timeout works better than tick in cases list is reordered. (where the name actually changes)
			setTimeout(() => thisFocusablePart?.focus(), 30);
		}
	});

	function onRenameItem(detail: EditDetail) {
		if (detail.prevValue !== detail.newValue) {
			const { newValue: newName } = detail;
			cbAppEnv.renameByProjection(recordProjection, newName);
		}
	}

	function deleteItem() {
		cbAppEnv.deleteByProjection(recordProjection);
		tick().then(() => afterDelete(thisElement as HTMLElement));
	}
</script>

<div
	bind:this={thisElement}
	transition:fadeAndSlide()
	class={['nav-collection-item', isElementPageForThisItem && 'current-item']}
	{...rest}
>
	{#if editingName}
		<div class="nav-collection-item-link">
			<InlineNameEditor
				value={recordProjection.projection.displayName}
				bind:editing={editingName}
				onedit={onRenameItem}
				class="nav-collection-item-label"
			/>
		</div>
	{:else}
		<a
			class="nav-collection-item-link"
			href="/{cbAppEnv.baseUrlPath}/{recordProjection.slug}"
			bind:this={thisFocusablePart}
			data-sveltekit-keepfocus
		>
			<InlineNameEditor
				value={recordProjection.projection.displayName}
				bind:editing={editingName}
				onedit={onRenameItem}
				class="nav-collection-item-label"
			/>
		</a>
	{/if}

	{#if showControls && !editingName}
		<div class="nav-collection-item-controls">
			<IconButton
				onclick={editItemName}
				tabindex={-1}
				{@attach createClickHotKeyAttachment('Rename', false, hotkey('r', 'alt'))}
			>
				<EditIcon />
			</IconButton>

			<IconButton
				onclick={deleteItem}
				tabindex={-1}
				{@attach createClickHotKeyAttachment('Delete', false, hotkey('d', 'alt'))}
			>
				<DeleteIcon />
			</IconButton>
		</div>
	{/if}
</div>

<style>
	.nav-collection-item {
		position: relative;

		inline-size: var(--sidebar-item-width, 100%);
		min-block-size: 36px;

		border-radius: 10px;
		overflow: hidden;

		&:is(:focus-within, :hover) {
			background-color: var(--cl-primary-dimmest);
		}

		&.current-item {
			background-color: var(--cl-primary-dimmer);
		}
	}

	.nav-collection-item-link {
		display: flex;
		align-items: center;

		inline-size: 100%;
		min-block-size: 36px;
		box-sizing: border-box;

		padding: var(--space-2) var(--space-2);
		padding-inline-end: 64px;

		text-decoration: none;
		color: var(--cl-on-surface);
	}

	.nav-collection-item-controls {
		position: absolute;
		inset-inline-end: var(--space-2);
		inset-block-start: 50%;
		translate: 0 -50%;

		z-index: 2;

		display: flex;
		gap: var(--space-1);
	}
</style>
