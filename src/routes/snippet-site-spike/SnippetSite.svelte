<script
	lang="ts"
	generics="
		TProps extends Record<string, any>
	"
>
	import type { Snippet } from 'svelte';

	let {
		snippet,
		snippetProps,
		content
	}: {
		snippet: Snippet<[TProps, Snippet]>;
		snippetProps: TProps;
		content: Snippet;
	} = $props();
</script>

{@render snippet(snippetProps, content)}
