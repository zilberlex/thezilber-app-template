<script>
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
</script>

<main class="ly-center">
	<NavigationScope scopeName="parent-scope">
		<div>
			<Button>A</Button>
			<Button>B</Button>
			<NavigationScope scopeName="child-scope">
				<div>
					<Button>A-2</Button>
					<Button>B-2</Button>
				</div>
			</NavigationScope>
		</div>
	</NavigationScope>
</main>

<style>
	div {
		display: flex;
		flex-direction: column;
	}
</style>
