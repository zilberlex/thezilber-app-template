<script lang="ts">
	// Parent proxy with a nested object
	const parent = $state({
		count: 0,
		child: {
			value: 0
		}
	});

	// Alias the nested child object
	const childAlias = parent.child;

	function incParentCount() {
		parent.count += 1;
	}

	function incChildViaParent() {
		parent.child.value += 1;
	}

	function incChildViaAlias() {
		childAlias.value += 1;
	}

	$effect(() => {
		console.log('effect(parent.count):', parent.count);
	});

	$effect(() => {
		console.log('effect(parent.child.value):', parent.child.value);
	});

	$effect(() => {
		console.log('effect(childAlias.value):', childAlias.value);
	});
</script>

<div>
	<h2>Nested proxy + child alias test</h2>

	<p><b>parent.count</b>: {parent.count}</p>
	<p><b>parent.child.value</b>: {parent.child.value}</p>
	<p><b>childAlias.value</b>: {childAlias.value}</p>

	<p><b>Same child object?</b> {parent.child === childAlias ? 'YES' : 'NO'}</p>

	<div style="display:flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;">
		<button onclick={incParentCount}>+1 parent.count</button>
		<button onclick={incChildViaParent}>+1 child via parent.child</button>
		<button onclick={incChildViaAlias}>+1 child via childAlias</button>
	</div>

	<hr style="margin: 1rem 0;" />
	<p>Open the console: effects should fire appropriately for each change.</p>
</div>
