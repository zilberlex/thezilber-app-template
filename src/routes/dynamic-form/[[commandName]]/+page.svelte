<!-- <script lang="ts"> -->
<!-- 	import Button from '$lib/ui/basic-components/Button.svelte'; -->
<!-- 	import { page, updated } from '$app/state'; -->
<!-- 	import { onDestroy, onMount, tick, untrack } from 'svelte'; -->
<!-- 	import { track } from '$lib/engine/svelte-helpers/track.svelte'; -->
<!-- 	import { createSmartHandler } from '$lib/engine/events/event-handling'; -->
<!-- 	import { -->
<!-- 		createClickHotKeyAttachment, -->
<!-- 		createFocusHotKeyAttachment -->
<!-- 	} from '$lib/engine/hotkeys/hotkey-actions'; -->
<!-- 	import { appState } from '$lib/engine/state/application-state.svelte'; -->
<!---->
<!-- 	import CommandBuilder from './CommandBuilder.svelte'; -->
<!-- 	import { goto } from '$app/navigation'; -->
<!-- 	import { type Page } from '@sveltejs/kit'; -->
<!-- 	import { saveCbState, updateCbState } from './command-builder-state-store'; -->
<!-- 	import type { Initializable } from '$lib/engine/types/utility-types'; -->
<!-- 	import Dialog from '$lib/ui/components/dialog/Dialog.svelte'; -->
<!-- 	import { browser } from '$app/environment'; -->
<!-- 	import OneLineForm from './OneLineForm.svelte'; -->
<!-- 	import { temporaryMessageState } from '$lib/engine/application/temp-messages/temporary-message-state.svelte'; -->
<!---->
<!-- 	import type { PageData } from './$types'; -->
<!-- 	import { AutoSaver } from './AutoSaver.svelte'; -->
<!---->
<!-- 	let { data: pageLoadData }: { data: PageData } = $props(); -->
<!---->
<!-- 	const identity = $derived(pageLoadData.routeKey); -->
<!---->
<!-- 	type AppData = CommandBuilderRecord; -->
<!---->
<!-- 	appState.pageContext.title = 'Command Builder'; -->
<!---->
<!-- 	let gCbData: Initializable<AppData> = $state({ -->
<!-- 		isInitialized: false, -->
<!-- 		data: { -->
<!-- 			commandStr: '', -->
<!-- 			formData: {} -->
<!-- 		} -->
<!-- 	} as Initializable<AppData>); -->
<!-- 	let isPermanentCommandPage = $derived(pageLoadData.pageMode === 'permanent'); -->
<!---->
<!-- 	const saveCommandBuilderDataCaptured: (data: AppData) => Promise<any> = $derived.by(() => { -->
<!-- 		track(isPermanentCommandPage); -->
<!---->
<!-- 		return untrack(() => { -->
<!-- 			return async (data: AppData) => saveCommandBuilderData(data, isPermanentCommandPage); -->
<!-- 		}); -->
<!-- 	}); -->
<!---->
<!-- 	let autoSaver: AutoSaver<AppData> | undefined; -->
<!-- 	let isSaveDialogOpen = $state(false); -->
<!---->
<!-- 	$effect(() => { -->
<!-- 		console.log('Loading Data For Command id', identity); -->
<!-- 		identity; -->
<!---->
<!-- 		untrack(() => { -->
<!-- 			gCbData = structuredClone(pageLoadData.cbData) as Initializable<AppData>; -->
<!-- 			gCbData.isInitialized = true; -->
<!-- 			autoSaver?.destroy(); -->
<!-- 			autoSaver = new AutoSaver(gCbData as AppData, async (data: AppData) => -->
<!-- 				saveCommandBuilderData(data, isPermanentCommandPage) -->
<!-- 			); -->
<!-- 		}); -->
<!-- 	}); -->
<!---->
<!-- 	onDestroy(async () => { -->
<!-- 		if (browser) { -->
<!-- 			await autoSaver?.saveData(gCbData); -->
<!-- 		} -->
<!-- 	}); -->
<!---->
<!-- 	function getPathWithoutParams(page: Page) { -->
<!-- 		return page.route.id ? page.route.id.replace(/\/[^/]+$/, '') : page.url.pathname; -->
<!-- 	} -->
<!---->
<!-- 	function saveCommandBuilderData(data: AppData, isPermanentCommandPage: boolean) { -->
<!-- 		let saveData = $state.snapshot(data); -->
<!-- 		console.log('Saving data', $state.snapshot(saveData)); -->
<!---->
<!-- 		if (isPermanentCommandPage) { -->
<!-- 			updateCbState({ kind: 'permanent', saveData: saveData }); -->
<!-- 		} else { -->
<!-- 			updateCbState({ kind: 'draft', saveData: saveData }); -->
<!-- 		} -->
<!---->
<!-- 		temporaryMessageState.message = isPermanentCommandPage -->
<!-- 			? `Saving Command [${gCbData?.data.commandName}]...` -->
<!-- 			: `Saving Draft...`; -->
<!-- 	} -->
<!---->
<!-- 	// TODO AZ: -->
<!-- 	// 1. goto back when fail. -->
<!-- 	// 2. do error handling and error message (temporary message) -->
<!-- 	//3. fix url thing when gotoing -->
<!-- 	async function saveNewCommand(commandName: string) { -->
<!-- 		let newCommand = $state.snapshot(gCbData); -->
<!-- 		newCommand.data.commandName = commandName; -->
<!-- 		let savePromise = saveCbState({ kind: 'permanent', saveData: newCommand }); -->
<!---->
<!-- 		let basePath = getPathWithoutParams(page); -->
<!-- 		await goto(`${basePath}/${newCommand.data.commandName}`); -->
<!-- 		savePromise.catch((e) => { -->
<!-- 			history.back(); -->
<!-- 			temporaryMessageState.setMessageWithTimout( -->
<!-- 				`Failed to save command [${commandName}] error message: ${e.message}`, -->
<!-- 				15000 -->
<!-- 			); -->
<!-- 		}); -->
<!-- 	} -->
<!---->
<!-- 	function defaultSaveButtonBehavior() { -->
<!-- 		if (isPermanentCommandPage) { -->
<!-- 			autoSaver?.saveData(gCbData); -->
<!-- 		} else { -->
<!-- 			openSaveAsPopup(); -->
<!-- 		} -->
<!-- 	} -->
<!---->
<!-- 	function openSaveAsPopup() { -->
<!-- 		isSaveDialogOpen = true; -->
<!-- 	} -->
<!---->
<!-- 	$effect(() => { -->
<!-- 		appState.debug.viewObject = gCbData; -->
<!-- 	}); -->
<!-- </script> -->
<!---->
<!-- <div class="mini-app"> -->
<!-- 	{#if isPermanentCommandPage} -->
<!-- 		<input -->
<!-- 			bind:value={gCbData.data.commandName} -->
<!-- 			class="input-title" -->
<!-- 			{@attach createFocusHotKeyAttachment('Modify Title', 'i', 'alt')} -->
<!-- 		/> -->
<!-- 	{/if} -->
<!-- 	<CommandBuilder bind:commandBuilderState={gCbData.data} /> -->
<!---->
<!-- 	<Button -->
<!-- 		class="button-save" -->
<!-- 		onclick={defaultSaveButtonBehavior} -->
<!-- 		{@attach createClickHotKeyAttachment('Save', 's', 'alt')} -->
<!-- 		>{isPermanentCommandPage ? 'Save' : 'Save As'}</Button -->
<!-- 	> -->
<!---->
<!-- 	{#if isPermanentCommandPage} -->
<!-- 		<Button -->
<!-- 			{@attach createClickHotKeyAttachment('Save As', 's', 'alt', 'shift')} -->
<!-- 			onclick={openSaveAsPopup} -->
<!-- 		> -->
<!-- 			Save As -->
<!-- 		</Button> -->
<!-- 	{/if} -->
<!-- </div> -->
<!---->
<!-- <Dialog bind:open={isSaveDialogOpen}> -->
<!-- 	<OneLineForm -->
<!-- 		title="Save New Command" -->
<!-- 		defaultInput="New Command" -->
<!-- 		onAction={(input) => saveNewCommand(input)} -->
<!-- 		actionText="Save" -->
<!-- 		onClose={() => (isSaveDialogOpen = false)} -->
<!-- 		id="save-as-form" -->
<!-- 	/> -->
<!-- </Dialog> -->
<!---->
<!-- <style lang="scss"> -->
<!-- 	.mini-app { -->
<!-- 		flex-direction: row; -->
<!-- 		width: min(600px, 80%); -->
<!-- 		position: relative; -->
<!-- 		justify-content: end; -->
<!-- 	} -->
<!---->
<!-- 	:global(.button-save) { -->
<!-- 		margin-top: var(--space-2); -->
<!-- 	} -->
<!---->
<!-- 	.input-title { -->
<!-- 		display: block; -->
<!-- 		width: 100%; -->
<!-- 		font-size: var(--font-size-4); -->
<!-- 		padding-left: var(--space-2); -->
<!-- 		margin-block-end: 4rem; -->
<!-- 		color: var(--cl-on-surface); -->
<!-- 		border-left: var(--base-border-thick); -->
<!-- 	} -->
<!-- </style> -->
