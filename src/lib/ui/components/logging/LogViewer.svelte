<script lang="ts">
	import { removeFromArrayPredicate } from '$lib/engine/general-js-ts/arrayRemoveByItem';
	import { composeTransitions } from '$lib/engine/transitions/transition-tools/transition-composition/compose-transitions';
	import { typewriter } from '$lib/engine/transitions/typewriter';
	import { cubicIn, cubicOut, linear, sineIn, sineInOut, sineOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import ScrollIndicator from '../ui-tricks/ScrollIndicator.svelte';
	import type { EngineLogger, LogContext, LogEvent, LogSeverity } from '$lib/engine/logging/engine-logger';
	import { ActionQueue } from '$lib/engine/patterns/action-queue';

	type LogLine = {
		severity: LogSeverity;
		message: string;
		context: LogContext;
	};

	type LogLineWithId = LogLine & { id: number };

	let { logger, direction = 'forward' }: { logger: EngineLogger; direction: 'forward' | 'reverse' } = $props();

	const logs = $state(new Array<LogLineWithId>());

	let logRemovalQueue = new ActionQueue();

	function freeze() {
		logRemovalQueue.freeze();
	}

	function unfreeze() {
		logRemovalQueue.unfreeze();
	}

	let trackingId = 0;
	const logInternal = (severity: LogSeverity, message: string, context: LogContext) => {
		const logId = ++trackingId;

		const logLineWithId = {
			id: logId,
			severity,
			message,
			context
		};

		logs.push(logLineWithId);

		setTimeout(() => {
			logRemovalQueue.queueAction(() => {
				removeFromArrayPredicate(logs, (item) => item.id === logId);

				console.log('Removed Log', {
					logId,
					logLIne: logLineWithId
				});
			});
		}, 5000);

		console[severity](message, context);
	};

	$effect(() => {
		const logLine = ({ severity, message, context }: LogEvent) => logInternal(severity, message, context);
		let unregister = logger.register(logLine);

		return () => unregister();
	});

	const composedTransitionIn = composeTransitions([
		{
			transition: slide,
			params: {
				delay: 0,
				duration: 300,
				axis: 'y',
				easing: cubicOut
			}
		},
		{
			transition: fade,
			params: {
				delay: 0,
				easing: sineOut,
				duration: 400
			}
		},
		{
			transition: typewriter,
			params: {
				easing: linear,
				delay: 50,
				speed: 4
			}
		}
	]);
	const composedTransitionOut = composeTransitions([
		{
			transition: slide,
			params: {
				delay: 0,
				duration: 300,
				axis: 'y',
				easing: cubicIn
			}
		},
		{
			transition: fade,
			params: {
				delay: 0,
				easing: cubicIn,
				duration: 300
			}
		}
	]);
</script>

<div class="log-viewer" onmouseenter={freeze} onmouseleave={unfreeze} role="region" aria-label="Log viewer">
	<ScrollIndicator>
		<div class={['log-viewer-logs', direction]}>
			{#each logs as logLine (logLine.id)}
				<div class={['log-line', 'box', logLine.severity]} in:composedTransitionIn out:composedTransitionOut>
					<span class="log-line-scope"><em>[</em>{logLine.context.scope}<em>]</em>:</span>
					{logLine.message}
				</div>
			{/each}
		</div>
	</ScrollIndicator>
</div>

<style lang="scss">
	.log-viewer {
		container-type: scroll-state;
		max-height: 100%;

		width: 300px;
		pointer-events: auto;

		overflow: scroll;
		scrollbar-width: none;

		@include bottom-scroll-anchor;
	}

	.log-viewer-logs {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		font-size: var(--font-size-sm);

		&.reverse {
			flex-direction: column-reverse;
		}

		.log-line {
			border-radius: var(--shape-element-radius);
			clip-path: (--shape-element-clip);
			mask: var(--shape-element-mask);

			font-style: italic;

			.log-line-scope {
				font-weight: 600;
				&,
				& * {
					font-style: normal !important;
				}
			}

			&:not(:last-child) {
				margin-block-end: var(--space-2);
			}
		}

		& .error {
			border-color: var(--cl-error);
			& em {
				color: var(--cl-error);
			}
		}

		& .warn {
			border-color: var(--cl-warn);
			& em {
				color: var(--cl-warn);
			}
		}
	}
</style>
