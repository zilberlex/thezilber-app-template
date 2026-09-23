<script>
	import {KeyboardNavigationScope} from '@svelte-ascend/keyboard-navigation/svelte';
	import Button from '$lib/ui/basic-components/Button.svelte';
</script>

<main class="ly-center">
	<div>
		<KeyboardNavigationScope scopeId="same">
			1
			<Button>1</Button>
			<Button>2</Button>
		</KeyboardNavigationScope>
		<KeyboardNavigationScope scopeId="same">
			2
			<Button>1</Button>
			<Button>2</Button>
		</KeyboardNavigationScope>
	</div>
</main>
