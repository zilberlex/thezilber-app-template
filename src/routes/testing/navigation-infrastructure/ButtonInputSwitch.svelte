<script lang="ts">
	import { HotKey } from '$lib/engine/hotkeys/hotkey-class';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { track } from '$lib/engine/svelte-helpers/track.svelte';
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

	function createSingleKeyDownHandler(key: HotKey, handler: (e: Event) => void) {
		let didFire = false;

		return (e: KeyboardEvent) => {
			if (didFire) {
				return;
			}

			if (key.test(HotKey.fromEvent(e)) < 0) {
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
		onkeydown={createSingleKeyDownHandler(hotkey('Enter'), (e) => commit(false, e))}
		bind:this={thisElement}
		{...rest}
	/>
{/if}
