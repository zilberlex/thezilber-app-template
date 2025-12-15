<script>
	import { createNumberByDigitsTween } from '$lib/engine/animation/animations/animate-number-by-digits';
	import { AnimatingValue } from '$lib/ui/AnimatedComponents/AnimatedValue/animating-number.svelte';
	import OutputCombo from '$lib/ui/basic-components/OutputCombo.svelte';

	const { fieldValues, outputFunc } = $props();

	let animatedValueByDigits = AnimatingValue.with(0, 1000, createNumberByDigitsTween);
	let animatedValue = $state(animatedValueByDigits);

	let finalValue = $derived(outputFunc(...fieldValues));

	$effect(() => {
		animatedValue.value = finalValue;
	});
</script>

<OutputCombo id="output" value={animatedValue.displayValue}>Output</OutputCombo>
