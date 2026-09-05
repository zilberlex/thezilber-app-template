<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ObjectViewer from './ObjectViewer.svelte';

	type Props = {
		objectName?: string;
		object?: object;
		recursive?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	let { objectName, object, recursive = false, class: userClass, ...rest }: Props = $props();

	function isPlainObject(value: unknown): value is Record<string, unknown> {
		if (value === null || typeof value !== 'object') return false;

		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	}

	function isRecursable(value: unknown): value is object {
		return (
			value !== null &&
			typeof value === 'object' &&
			(Array.isArray(value) || value instanceof Map || isPlainObject(value))
		);
	}

	function getClassSummary(value: object): string {
		const proto = Object.getPrototypeOf(value);
		const name = proto?.constructor?.name ?? 'Object';

		if (value instanceof Date) {
			return `${name}(${value.toISOString()})`;
		}

		if (value instanceof Set) {
			return `${name}(${value.size})`;
		}

		const descriptors = proto ? Object.getOwnPropertyDescriptors(proto) : {};

		const api = Object.entries(descriptors)
			.filter(([key]) => key !== 'constructor')
			.map(([key, descriptor]) => {
				if (typeof descriptor.value === 'function') return `${key}()`;
				if (descriptor.get && descriptor.set) return `${key} { get; set; }`;
				if (descriptor.get) return `${key} { get; }`;
				if (descriptor.set) return `${key} { set; }`;
				return key;
			});

		return api.length ? `${name} { ${api.join(', ')} }` : name;
	}

	function formatValue(value: unknown): string {
		if (value === null) return 'null';
		if (value === undefined) return 'undefined';

		if (typeof value === 'string') return value;
		if (typeof value === 'bigint') return `${value}n`;
		if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;

		if (typeof value === 'object' && !isRecursable(value)) {
			return getClassSummary(value);
		}

		try {
			return JSON.stringify($state.snapshot(value));
		} catch {
			return String(value);
		}
	}

	let objIterable = $derived.by(() => {
		if (!object) return [];

		if (object instanceof Map) {
			return [...object.entries()];
		}

		if (Array.isArray(object)) {
			return object.map((v, i) => [i, v] as const);
		}

		return Object.entries(object);
	});
</script>

<div {...rest} class={[userClass, 'object-viewer']}>
	{#if objectName}
		<strong>{objectName}:</strong>
	{/if}

	{#each objIterable as [key, value]}
		<div class="item">
			<span class="key">{key}</span>:

			{#if recursive && isRecursable(value)}
				<div>
					{'{'}<br />
					<ObjectViewer object={value} {recursive} />
					{'}'}<br />
				</div>
			{:else}
				<span class="value">{formatValue(value)}</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.object-viewer {
		overflow-y: scroll;
	}

	div {
		display: flex;
		flex-direction: column;
	}

	.item {
		display: flex;
		flex-direction: row;
	}

	.key {
		color: var(--cl-primary);
		font-weight: bold;
	}

	.value {
		font-style: italic;
	}

	strong {
		text-decoration: underline var(--cl-primary);
	}
</style>
