<script lang="ts">
	import { AnimatingValue } from '../../lib/ui/AnimatedComponents/AnimatedValue/animating-number.svelte';
	import { countFractionDigits } from '$lib/engine/animation/math-utils';
	import { createNumberByDigitsTween } from '$lib/engine/animation/animations/animate-number-by-digits';
	import type { DynamicFormSchema } from '$lib/app/dynamic-form/dynamic-form-types';
	import DynamicForm from '$lib/app/dynamic-form/DynamicForm.svelte';
	import AnimatedNumberOutput from './AnimatedNumberOutput.svelte';

	let field1 = $state(8);
	let field2 = $state(10);

	let sum = $derived(field1 + field2);

	// let animatedValue = AnimatingValue.withBasicTween(0, 1000);
	let animatedValueByDigits = AnimatingValue.with(0, 1000, createNumberByDigitsTween);
	let animatedValueNaive = AnimatingValue.withBasicTween(0, 1000);
	let animatedValue = $state(animatedValueByDigits);

	$effect(() => {
		let fracDigits1 = countFractionDigits(field1);
		let fracDigits2 = countFractionDigits(field2);
		const maxFracDigits = Math.min(4, Math.max(fracDigits1, fracDigits2));

		animatedValue.digitsAfterDec = maxFracDigits;
		animatedValue.value = sum;
	});

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
