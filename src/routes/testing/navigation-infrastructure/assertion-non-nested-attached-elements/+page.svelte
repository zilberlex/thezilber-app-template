<script lang="ts">
	import type { ScopeInfra } from '$lib/packages/keyboard-navigation';
	import { markForNavigation, NavigationScope } from '$lib/packages/keyboard-navigation/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';

	let scope = $state<ScopeInfra>();

	$effect(() => {
		if (scope) {
			(globalThis as any).scope = scope;
		}
	});
</script>

<main class="ly-center">
	<NavigationScope scopeId="justScope" discoveryMode="marked" bind:scopeRet={scope}>
		<div class="outer" {@attach markForNavigation()}>
			<div class="inner" {@attach markForNavigation()}>
				<Button>Inner Button</Button>
			</div>
		</div>
	</NavigationScope>
</main>
