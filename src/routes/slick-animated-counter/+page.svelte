<script lang="ts">
	import type { DynamicFormSchema } from '$lib/app/dynamic-form/dynamic-form-types';
	import DynamicForm from '$lib/app/dynamic-form/DynamicForm.svelte';
	import AnimatedNumberOutput from '$lib/app/dynamic-form/dynamic-forms-outputs/AnimatedNumberOutput.svelte';

	let schema: DynamicFormSchema = [
		{ name: 'X', type: 'number' },
		{ name: 'Y', type: 'number' }
	];
</script>

<div class="mini-app">
	<DynamicForm {schema} outputFunc={(x, y) => x + y} OutputComponent={AnimatedNumberOutput} />
</div>

<style lang="scss">
	.mini-app {
		width: min(600px, 80%);
		position: relative;
	}
</style>
