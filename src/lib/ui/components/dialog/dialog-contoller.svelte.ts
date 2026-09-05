import { tick, type Snippet } from 'svelte';

export interface DialogEntry {
	id: string;
	renderSnippet: Snippet;
}

export interface DialogController {
	get activeDialog(): DialogEntry | null;

	hasDialog(id: string): boolean;

	openDialog(id: string, render: Snippet): void;
	closeDialog(id: string): void;
	closeTopDialog(): void;
	closeAllDialogs(): void;
}

export function createDialogController(): DialogController {
	let _dialogStack: DialogEntry[] = $state([]);
	let _activeDialog = $derived(_dialogStack.at(-1));

	const hasDialog = (id: string) => {
		return _dialogStack.some((d) => d.id == id);
	};

	return {
		get activeDialog() {
			return _activeDialog ?? null;
		},
		openDialog(id: string, renderSnippet: Snippet) {
			if (hasDialog(id)) return;

			_dialogStack.push({
				id,
				renderSnippet
			});
		},
		closeTopDialog() {
			_dialogStack.pop();
		},
		closeAllDialogs() {
			_dialogStack.length = 0;
		},
		closeDialog(id: string) {
			const index = _dialogStack.findIndex((dialog) => dialog.id === id);
			if (index === -1) return;

			_dialogStack.splice(index, 1);
		},
		hasDialog
	};
}
