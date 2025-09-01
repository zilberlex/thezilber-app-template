<script lang="ts">
	import type { Snippet } from "svelte";

    type InputComboProps = {
        id: string;
        placeholder?: string;
        value?: any;
        type?: string;
        children?: Snippet;
    }

    let {id, placeholder, type, value = $bindable(), children}: InputComboProps = $props();
</script>

<input-combo>
    <label for={id}>{@render children?.()}<span class="suffix">:</span></label>        
    <input bind:value={value} type={type} name={id} id={id} placeholder={placeholder} required>
</input-combo>