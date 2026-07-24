export type ProbeProps = {
	siteId: string;
	label: string;
	onMountProbe: (root: HTMLElement) => void;
	onDestroyProbe: () => void;
	onInternalChange: (value: number) => void;
	onInputChange: (value: string) => void;
};
