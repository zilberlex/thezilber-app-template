<script lang="ts">
	let { label }: { label: string } = $props();

	let count = $state(0);
	let value = $state('');
</script>

<div class="probe">
	<strong>{label}</strong>

	<button type="button" onclick={() => count++}>
		Local count: {count}
	</button>

	<label>
		Local input
		<input bind:value />
	</label>
</div>

<style>
	.probe {
		display: grid;
		gap: 0.5rem;
	}

	label {
		display: grid;
		gap: 0.25rem;
	}
</style>
