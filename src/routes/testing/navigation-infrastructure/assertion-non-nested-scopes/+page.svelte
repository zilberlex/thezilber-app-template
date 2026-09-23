<script>
	import {KeyboardNavigationScope} from '@svelte-ascend/keyboard-navigation/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
</script>

<main class="ly-center">
	<KeyboardNavigationScope scopeId="parent-scope">
		<div>
			<Button>A</Button>
			<Button>B</Button>
			<KeyboardNavigationScope scopeId="child-scope">
				<div>
					<Button>A-2</Button>
					<Button>B-2</Button>
				</div>
			</KeyboardNavigationScope>
		</div>
	</KeyboardNavigationScope>
</main>

<style>
	div {
		display: flex;
		flex-direction: column;
	}
</style>
