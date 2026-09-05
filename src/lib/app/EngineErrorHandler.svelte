<script lang="ts">
	import { onMount } from 'svelte';
	import { on } from 'svelte/events';

	import { EngineError, reportEngineError } from '$lib/engine/error/engine-error';

	function handleError(event: ErrorEvent) {
		if (event.error instanceof EngineError) {
			reportEngineError(event.error);
			event.preventDefault();
		}
	}

	function handleUnhandledRejection(event: PromiseRejectionEvent) {
		if (event.reason instanceof EngineError) {
			reportEngineError(event.reason);
			event.preventDefault();
		}
	}

	onMount(() => {
		const removeErrorListener = on(window, 'error', handleError);
		const removeUnhandledRejectionListener = on(window, 'unhandledrejection', handleUnhandledRejection);

		return () => {
			removeErrorListener();
			removeUnhandledRejectionListener();
		};
	});
</script>
