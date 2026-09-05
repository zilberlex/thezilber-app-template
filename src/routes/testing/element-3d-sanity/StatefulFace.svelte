<script lang="ts">
	let {
		label
	}: {
		label: string;
	} = $props();

	let count = $state(0);
</script>

<button type="button" onclick={() => count++}>
	{label}: {count}
</button>
