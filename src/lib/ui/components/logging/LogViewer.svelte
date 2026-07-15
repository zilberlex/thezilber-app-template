<script lang="ts">
	import { removeFromArrayPredicate } from '$lib/engine/general-js-ts/arrayRemoveByItem';
	import { composeTransitions } from '$lib/engine/transitions/transition-tools/transition-composition/compose-transitions';
	import { typewriter } from '$lib/engine/transitions/typewriter';
	import { cubicIn, cubicOut, linear, sineIn, sineInOut, sineOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	type LogSeverity = 'debug' | 'info' | 'warn' | 'error';
	type LogContext = Record<string, unknown> & { scope: string };
	type LogLine = {
		severity: LogSeverity;
		message: string;
		context: LogContext;
	};

	type LogLineWithId = LogLine & { id: number };

	export interface EngineLogger {
		log: (message: string, context: LogContext) => void;
		debug: (message: string, context: LogContext) => void;
		warn: (message: string, context: LogContext) => void;
		error: (message: string, context: LogContext) => void;
	}

	let { logger = $bindable(), direction = 'forward' }: { logger?: EngineLogger; direction: 'forward' | 'reverse' } =
		$props();

	const logs = $state(new Array<LogLineWithId>());

	let lineId = 0;
	const logInternal = (severity: LogSeverity, message: string, context: LogContext) => {
		const logId = ++lineId;
		logs.push({
			id: logId,
			severity,
			message,
			context
		});

		setTimeout(() => {
			let logLine = removeFromArrayPredicate(logs, (item) => item.id === logId);

			console.log('Removed Log', {
				logId,
				logLIne: logLine
			});
		}, 5000);

		console[severity](message, context);
	};

	logger = {
		log: (message: string, context: LogContext) => {
			logInternal('info', message, context);
		},
		debug: (message: string, context: LogContext) => {
			logInternal('debug', message, context);
		},
		warn: (message: string, context: LogContext) => {
			logInternal('warn', message, context);
		},
		error: (message: string, context: LogContext) => {
			logInternal('error', message, context);
		}
	};

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

<div class="log-viewer">
	<div class={['log-viewer-logs', direction]}>
		{#each logs as logLine (logLine.id)}
			<div class={['log-line', 'box', logLine.severity]} in:composedTransitionIn out:composedTransitionOut>
				<span class="log-line-scope"><em>[</em>{logLine.context.scope}<em>]</em>:</span>
				{logLine.message}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.log-viewer {
		max-height: 100%;
		pointer-events: auto;

		overflow: scroll;
		scrollbar-width: none;

		@include bottom-scroll-anchor;
	}

	.log-viewer-logs {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;

		&.reverse {
			flex-direction: column-reverse;
		}

		.log-line {
			border-radius: var(--shape-element-radius);
			clip-path: (--shape-element-clip);
			mask: var(--shape-element-mask);

			margin-block-end: var(--space-2);

			font-style: italic;

			.log-line-scope {
				font-weight: 600;
				&,
				& * {
					font-style: normal !important;
				}
			}
		}

		& .error {
			border-color: var(--cl-error);
			& em {
				color: var(--cl-error);
			}
		}
	}
</style>
