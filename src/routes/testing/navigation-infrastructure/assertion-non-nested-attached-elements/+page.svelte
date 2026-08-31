<script lang="ts">
	import { markForNavigation } from '$lib/engine/keyboard-navigation/svelte-components/attachments';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import type { ScopeInfra } from '$lib/engine/keyboard-navigation/types';
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
