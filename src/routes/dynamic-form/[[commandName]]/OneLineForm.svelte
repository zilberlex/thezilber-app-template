<!-- <script lang="ts"> -->
<!-- 	import { browser } from '$app/environment'; -->
<!-- 	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions'; -->
<!-- 	import { -->
<!-- 		loadSessionStorage, -->
<!-- 		saveSessionStorage -->
<!-- 	} from '$lib/engine/storage/session/session-storage'; -->
<!-- 	import Button from '$lib/ui/basic-components/Button.svelte'; -->
<!-- 	import InputCombo from '$lib/ui/basic-components/InputCombo.svelte'; -->
<!-- 	import { onMount } from 'svelte'; -->
<!---->
<!-- 	type BasicFunction = (x: string) => void; -->
<!---->
<!-- 	type Props = { -->
<!-- 		title?: string; -->
<!-- 		onAction: BasicFunction; -->
<!-- 		onClose: () => {}; -->
<!-- 		actionText?: string; -->
<!-- 		defaultInput?: string; -->
<!-- 		id: string; -->
<!-- 	}; -->
<!---->
<!-- 	let { -->
<!-- 		title = 'Form', -->
<!-- 		onAction, -->
<!-- 		onClose, -->
<!-- 		actionText = 'Save', -->
<!-- 		defaultInput = 'Input Here', -->
<!-- 		id -->
<!-- 	}: Props = $props(); -->
<!---->
<!-- 	let inputField = $state(defaultInput); -->
<!---->
<!-- 	onMount(() => { -->
<!-- 		if (browser) { -->
<!-- 			let sessionItem = loadSessionStorage<typeof inputField>(id); -->
<!-- 			inputField = sessionItem ? sessionItem : inputField; -->
<!-- 		} -->
<!---->
<!-- 		return () => { -->
<!-- 			saveSessionStorage(id, inputField); -->
<!-- 		}; -->
<!-- 	}); -->
<!-- </script> -->
<!---->
<!-- <form class="form box" {id}> -->
<!-- 	<h3 class="form-title">{title}</h3> -->
<!-- 	<div class="form-content"> -->
<!-- 		<InputCombo bind:value={inputField} hotkey={{ hotkey: '1', tooltip: 'Input' }} -->
<!-- 			>Command Name</InputCombo -->
<!-- 		> -->
<!-- 	</div> -->
<!-- 	<div class="form-controls"> -->
<!-- 		<Button -->
<!-- 			onclick={() => onAction(inputField)} -->
<!-- 			{@attach createClickHotKeyAttachment(actionText, 'Enter', 'alt')} -->
<!-- 		> -->
<!-- 			{actionText} -->
<!-- 		</Button> -->
<!---->
<!-- 		<Button onclick={onClose} {@attach createClickHotKeyAttachment('Close Dialog', 'q', 'alt')}> -->
<!-- 			Close -->
<!-- 		</Button> -->
<!-- 	</div> -->
<!-- </form> -->
<!---->
<!-- <style> -->
<!-- 	.form { -->
<!-- 		display: flex; -->
<!-- 		flex-direction: column; -->
<!-- 		padding: var(--space-2); -->
<!---->
<!-- 		.form-title { -->
<!-- 			margin-bottom: var(--space-4); -->
<!-- 		} -->
<!---->
<!-- 		.form-content { -->
<!-- 			margin-bottom: var(--space-8); -->
<!-- 		} -->
<!---->
<!-- 		.form-controls { -->
<!-- 			display: flex; -->
<!-- 			flex-direction: row-reverse; -->
<!-- 			gap: var(--space-3); -->
<!-- 		} -->
<!-- 	} -->
<!-- </style> -->
