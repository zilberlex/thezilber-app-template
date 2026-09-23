<script lang="ts">
	import { browser } from '$app/environment';
	import {
		assignNavigationManagerKeys,
		markForNavigation,
		KeyboardNavigationScope
	} from '@svelte-ascend/keyboard-navigation/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';
	import { kbKey } from '@svelte-ascend/core';

	function focusImmediately(node: HTMLElement) {
		node.focus();
	}

	onMount(() => {
		if (browser) {
			assignNavigationManagerKeys(kbKey('t'), kbKey('t', 'shift'));
		}
	});
</script>

<main class="ly-center">
	<div class="flex-row">
		<KeyboardNavigationScope scopeId="scope-a" class="flex-col">
			<Button>1</Button>
			<Button>2</Button>
			<Button>3</Button>
			<Button {@attach focusImmediately}>4 - Focused Immediataly</Button>
			<Button>5</Button>
		</KeyboardNavigationScope>
		<KeyboardNavigationScope scopeId="scope-marked" class="flex-col" discoveryMode="marked">
			<Button {@attach markForNavigation()}>1</Button>
			<Button {@attach markForNavigation()}>2</Button>
			<Button {@attach markForNavigation()} {@attach focusImmediately}>3 - Focused Immediataly Marked Mode</Button>
			<Button {@attach markForNavigation()}>4</Button>
			<Button {@attach markForNavigation()}>5</Button>
		</KeyboardNavigationScope>
	</div>
</main>
