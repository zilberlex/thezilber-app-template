<script lang="ts">
	import type { Snippet } from "svelte";

    type InputComboProps = {
        id: string;
        placeholder?: string;
        value?: any;
        type?: string;
        minLableWidth?: number;
        children?: Snippet;
    }

    let {id, placeholder, type, minLableWidth = 0, value = $bindable(), children}: InputComboProps = $props();
</script>

<input-combo>
    <label for={id}><span class="prefix" style="min-width: {minLableWidth}">{@render children?.()}</span><span class="suffix">:</span></label>        
    <input bind:value={value} type={type} name={id} id={id} placeholder={placeholder} required>
</input-combo>