<script lang="ts">
	import type { ScopeInfra } from '@svelte-ascend/keyboard-navigation';
	import { markForNavigation, KeyboardNavigationScope } from '@svelte-ascend/keyboard-navigation/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let scope = $state<ScopeInfra>();

	$effect(() => {
		if (scope) {
			(globalThis as any).scope = scope;
		}
	});
</script>

<main class="ly-center">
	<KeyboardNavigationScope scopeId="justScope" discoveryMode="marked" bind:scopeRet={scope}>
		<div class="outer" {@attach markForNavigation()}>
			<div class="inner" {@attach markForNavigation()}>
				<Button>Inner Button</Button>
			</div>
		</div>
	</KeyboardNavigationScope>
</main>
