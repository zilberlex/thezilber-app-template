<script lang="ts">
	import { browser } from '$app/environment';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import { markForNavigation } from '$lib/engine/keyboard-navigation/svelte-components/attachments';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { assignNavigationManagerKeys } from '$lib/engine/keyboard-navigation/svelte-components/sveltekit-helpers';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { onMount } from 'svelte';

	function focusImmediately(node: HTMLElement) {
		node.focus();
	}

	onMount(() => {
		if (browser) {
			assignNavigationManagerKeys(hotkey('t'), hotkey('t', 'shift'));
		}
	});
</script>

<main class="ly-center">
	<div class="flex-row">
		<NavigationScope scopeId="scope-a" class="flex-col">
			<Button>1</Button>
			<Button>2</Button>
			<Button>3</Button>
			<Button {@attach focusImmediately}>4 - Focused Immediataly</Button>
			<Button>5</Button>
		</NavigationScope>
		<NavigationScope scopeId="scope-marked" class="flex-col" discoveryMode="marked">
			<Button {@attach markForNavigation()}>1</Button>
			<Button {@attach markForNavigation()}>2</Button>
			<Button {@attach markForNavigation()} {@attach focusImmediately}>3 - Focused Immediataly Marked Mode</Button>
			<Button {@attach markForNavigation()}>4</Button>
			<Button {@attach markForNavigation()}>5</Button>
		</NavigationScope>
	</div>
</main>
