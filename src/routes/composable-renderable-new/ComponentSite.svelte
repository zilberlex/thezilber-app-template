<script
	lang="ts"
	generics="
		TProps extends Record<string, any>
	"
>
	import type { Component } from 'svelte';

	let {
		component: CurrentComponent,
		componentProps
	}: {
		component: Component<TProps>;
		componentProps: TProps;
	} = $props();
</script>

<CurrentComponent {...componentProps} />
