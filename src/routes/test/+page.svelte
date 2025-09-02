<script>
	import { AnimatingValue } from "../../lib/ui/AnimatedComponents/AnimatedValue/animating-number.svelte";
	import InputCombo from "./InputCombo.svelte";
	import OutputCombo from "./OutputCombo.svelte";
	import { countFractionDigits } from "$lib/engine/animation/math-utils";

    let field1 = $state(8);
    let field2 = $state(10);

    let sum = $derived(field1 + field2);

    let animatedValue = AnimatingValue.withBasicTween();
    $effect(() => {
        let fracDigits1 = countFractionDigits(field1);
        let fracDigits2 = countFractionDigits(field2);
        const maxFracDigits = Math.min(4, Math.max(fracDigits1, fracDigits2));

        animatedValue.digitsAfterDec = maxFracDigits;
        animatedValue.value = sum;
    });
    
    let output = $derived(animatedValue.displayValue);
</script>

<main class="mini-app box box-highlight">
    <div class="input-area">
            <InputCombo type="number" bind:value={field1} id="field1" placeholder="input1">X</InputCombo>
            <InputCombo type="number" bind:value={field2} id="field2" placeholder="input2">Y</InputCombo>
    </div>

    <OutputCombo id="output" value={output}>Output</OutputCombo>
</main>

<style lang="scss">
    .mini-app {
        width: min(600px, 80%);
        height: min(400px, 60%);

        position: relative;

        .input-area {
            display: flex;
            flex-direction: column;
        }
    }

    :global(output-combo) {
        position: absolute;
        inset-inline: var(--padding-2);
        bottom: var(--padding-1);

        display: inline-block;
        font-weight: bold;
    }
</style>