<script lang="ts">
	import DeleteIcon from '$lib/assets/icons/DeleteIcon.svelte';
	import EditIcon from '$lib/assets/icons/EditIcon.svelte';
	import IconButton from '$lib/ui/basic-components/IconButton.svelte';
	import InlineNameEditor, { type EditDetail } from '$lib/ui/components/InlineNameEditor.svelte';
	import { fade } from 'svelte/transition';
	import type { CbAppEnv, CbProjection, CbRecordProjection } from './command-builder-types';

	type Props = {
		cbAppEnv: CbAppEnv;
		recordProjection: CbRecordProjection;
		recordId: string;
	};

	let { cbAppEnv, recordProjection, recordId }: Props = $props();

	let active = $state(false);
	let editingName = $state(false);

	function editItemName() {
		editingName = true;
	}

	function onRenameItem(detail: EditDetail) {
		const { newValue: newName } = detail;
		cbAppEnv.renameByProjection(recordProjection, newName);
	}

	function deleteItem() {
		cbAppEnv.deleteByProjection(recordProjection);
	}
</script>

<div
	transition:fade={{ duration: 200 }}
	class={['nav-collection-item', recordProjection.slug === cbAppEnv.slug && 'current-item']}
	onfocusin={() => (active = true)}
	onfocusout={(e) => {
		if (editingName) return;

		const nextFocused = e.relatedTarget as Node | null;

		if (!e.currentTarget.contains(nextFocused)) {
			active = false;
		}
	}}
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
		<a class="nav-collection-item-link" href="/{cbAppEnv.baseUrlPath}/{recordProjection.slug}">
			<InlineNameEditor
				value={recordProjection.projection.displayName}
				bind:editing={editingName}
				onedit={onRenameItem}
				class="nav-collection-item-label"
			/>
		</a>
	{/if}

	{#if active && !editingName}
		<div class="nav-collection-item-controls">
			<IconButton onclick={editItemName} tabindex={-1}>
				<EditIcon />
			</IconButton>

			<IconButton tabindex={-1} onclick={deleteItem}>
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

		border-radius: 15px;
		overflow: hidden;

		&:is(.current-item, :focus-within, :hover) {
			background-color: var(--cl-primary-dimmest);
		}
	}

	.nav-collection-item-link {
		display: flex;
		align-items: center;

		inline-size: 100%;
		min-block-size: 36px;
		box-sizing: border-box;

		padding: var(--space-1) var(--space-2);
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
