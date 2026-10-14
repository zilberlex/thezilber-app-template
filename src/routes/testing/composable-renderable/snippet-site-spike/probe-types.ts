import type { Snippet } from 'svelte';

export type SnippetProbeProps = {
	siteId: string;
	label: string;
	onMountProbe: (root: HTMLElement) => void;
	onDestroyProbe: () => void;
	onInternalChange: (value: number) => void;
	onInputChange: (value: string) => void;
};

export type ProbeSnippet = Snippet<[SnippetProbeProps, Snippet]>;
