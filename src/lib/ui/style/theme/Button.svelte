<script>
    const { children, ...restProps } = $props();
</script>

<button {...restProps}>
    <span>{@render children()}</span>
</button>
