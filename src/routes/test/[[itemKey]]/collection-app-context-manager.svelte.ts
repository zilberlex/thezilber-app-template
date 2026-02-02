import { pushState, replaceState } from '$app/navigation';
import { deepAssign } from '$lib/app-infrastructure/async-state.svelte';
import type { Page } from '@sveltejs/kit';

type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	moveRouteRelative: (itemKey: string) => { undoMoveRoute: () => void };
};

export function createCollectionAppContextManager<TContext extends CollectionAppContext>(
	page: Page
): CollectionAppContextManager<TContext> {
	let slugItemKey = page.params.itemKey;
	let itemKey = $state(slugItemKey ?? '_draft_');
	let editMode: EditMode = $state(slugItemKey ? 'permanent' : 'draft');

	let appContext = $derived({
		itemKey,
		editMode
	}) as TContext;

	return {
		get appContext() {
			return appContext;
		},
		moveRouteRelative(itemKey: string) {
			let prevContext = { ...appContext };
			let prevState = page.state;
			let prevUrl = page.url;

			const newUrl = new URL(page.url);
			newUrl.pathname = `/${itemKey}`;

			appContext.itemKey = itemKey;
			pushState(newUrl, { itemKey });

			return {
				undoMoveRoute: () => {
					deepAssign(appContext, prevContext);
					replaceState(prevUrl, prevState);
				}
			};
		}
	};
}

export function moveRouteRelaltive(
	appContext: CollectionAppContext,
	newAppContext: CollectionAppContext,
	page: Page,
	baseRouteKey: string
) {
	let prevContext = {};
	deepAssign(prevContext, appContext);
	deepAssign(appContext, newAppContext);

	const newItemKey = appContext.itemKey;

	const prevUrl = page.url;
	const prevState = page.state;

	const newUrl = new URL(page.url);
	newUrl.pathname = `/${newItemKey}`;

	pushState(newUrl, { itemKey: newItemKey });

	return {
		undo: () => {
			deepAssign(appContext, prevContext);
			replaceState(prevUrl, prevState);
		}
	};
}
