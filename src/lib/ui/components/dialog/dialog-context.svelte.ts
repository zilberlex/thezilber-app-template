import type { Snippet } from 'svelte';

export interface ActiveDialogController {
	openActiveDialog: (renderSnippet: Snippet) => void;
	closeAllActiveDialogs: () => void;
	closeActiveDialog: (renderSnippet: Snippet) => void;
}

export interface ActiveDialogState {
	activeElementRender: Snippet | null;
	isOpen: boolean;
}

export const activeDialogState: ActiveDialogState = $state({
	activeElementRender: null,
	isOpen: false
});

export const activeDialogController: ActiveDialogController = {
	openActiveDialog(renderSnippet: Snippet) {
		activeDialogState.activeElementRender = renderSnippet;
		activeDialogState.isOpen = true;
	},
	closeAllActiveDialogs() {
		activeDialogState.isOpen = false;
	},
	closeActiveDialog(renderSnippet: Snippet) {
		if (activeDialogState.activeElementRender === renderSnippet) activeDialogState.isOpen = false;
	}
};
