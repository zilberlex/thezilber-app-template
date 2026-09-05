<script>
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
</script>

<main class="ly-center">
	<div>
		<NavigationScope scopeId="same">
			1
			<Button>1</Button>
			<Button>2</Button>
		</NavigationScope>
		<NavigationScope scopeId="same">
			2
			<Button>1</Button>
			<Button>2</Button>
		</NavigationScope>
	</div>
</main>
