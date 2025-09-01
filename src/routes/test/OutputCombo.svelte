<script lang="ts">
	import type { Snippet } from "svelte";

    type OutpuComboProps = {
        id: string;
        value?: any;
        children?: Snippet;
    }

    let {id, value, children}: OutpuComboProps = $props();
</script>

<output-combo>
    <label for="output" >{@render children?.()}<span class="suffix">:</span></label>
    <output id={id} class="ul-txt-primary">{value}</output>
</output-combo>
