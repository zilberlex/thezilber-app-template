import type { Snippet } from 'svelte';

export interface DialogController {
	get activeElementRender(): Snippet | null;
	get isOpen(): boolean;
	get currentlyOpendId(): string | null;
	openActiveDialog: (id: string, renderSnippet: Snippet) => void;
	closeAllActiveDialogs: () => void;
	closeActiveDialog: (id: string) => void;
}

export function createDialogController(): DialogController {
	let _activeElementRender = $state<Snippet | null>(null);
	let _isOpen = $state(false);
	let _id = $state<string | null>(null);
	return {
		get activeElementRender() {
			return _activeElementRender;
		},
		get isOpen() {
			return _isOpen;
		},
		get currentlyOpendId() {
			return _id;
		},

		openActiveDialog(id: string, renderSnippet: Snippet) {
			_activeElementRender = renderSnippet;
			_isOpen = true;
			_id = id;
		},
		closeAllActiveDialogs() {
			_isOpen = false;
			_id = null;
		},
		closeActiveDialog(id: string) {
			if (_id === id) {
				_isOpen = false;
				_id = null;
			}
		}
	};
}
