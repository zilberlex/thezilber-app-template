<script lang="ts">
    const { urls } = $props();
</script>

<ul>
    {#each urls as url}
        <li><a href={url}>{url}</a></li>
    {/each}
</ul>

<style>
    ul {
        font-size: var(--font-size-2);
    }
</style>