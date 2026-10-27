import { createContext, type Snippet } from 'svelte';

export type TabDefinition = {
	id: symbol;
	name: string;
	color?: string;
	content: Snippet;
};

export const [getTabsContext, setTabsContext] = createContext<{
	register: (tab: TabDefinition) => () => void;
}>();
