<script lang="ts">
	import { KbKey } from '@svelte-ascend/core';
	import { kbKey } from '@svelte-ascend/core';
	import { track } from '@svelte-ascend/core/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let { content = $bindable<string>(), ...rest } = $props();

	let sw = $state(false);

	let thisElement = $state<HTMLElement>();
	let init = false;

	function commit(val: boolean, e?: Event) {
		sw = val;
		console.log('Switch changed', {
			sw,
			eventTarget: e?.target
		});
	}

	$effect(() => {
		track(thisElement);
		if (init) {
			thisElement?.focus();
		} else {
			init = true;
		}
	});

	function createSingleKeyDownHandler(key: KbKey, handler: (e: Event) => void) {
		let didFire = false;

		return (e: KeyboardEvent) => {
			if (didFire) {
				return;
			}

			if (key.test(KbKey.fromEvent(e)) < 0) {
				return;
			}

			didFire = true;

			handler(e);
		};
	}
</script>

{#if !sw}
	<Button onclick={(e: Event) => commit(true, e)} bind:thisNode={thisElement} {...rest}>
		{content}
	</Button>
{:else}
	<input
		bind:value={content}
		onblur={() => commit(false)}
		onkeyup={createSingleKeyDownHandler(kbKey('Enter'), (e) => commit(false, e))}
		bind:this={thisElement}
		{...rest}
	/>
{/if}
