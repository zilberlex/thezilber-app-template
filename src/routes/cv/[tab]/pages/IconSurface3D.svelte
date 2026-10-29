<script>
	let { children, class: userClass, ...rest } = $props();
</script>

<div {...rest} class={userClass}>
	{@render children?.()}
</div>
