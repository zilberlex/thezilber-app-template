import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { deepAssign } from '$lib/app-infrastructure/async-state.svelte';
import type { Page } from '@sveltejs/kit';

type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	moveRouteRelative: (itemKey: string) => { undoMoveRoute: () => void };
};

export function createCollectionAppContextManager<
	TContext extends CollectionAppContext
>(): CollectionAppContextManager<TContext> {
	let slugItemKey = page.params.itemKey;

	let _itemKey = $state(slugItemKey ?? '_draft_');
	let _editMode: EditMode = $derived(_itemKey === '_draft_' ? 'draft' : 'permanent');

	let appContext = $state({
		get itemKey() {
			return _itemKey;
		},
		get editMode() {
			return _editMode;
		}
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
			newUrl.pathname = `${getBasePath(page, '[[itemKey]]')}/${itemKey}`;

			_itemKey = itemKey;
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

// TODO AZ move to engine
function escapeRegex(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getBasePath(page: Page, trimmedSuffix: string = '[[itemKey]]') {
	let routeId = page.route.id ?? '';

	const suffix = trimmedSuffix.startsWith('/') ? trimmedSuffix : '/' + trimmedSuffix;

	const re = new RegExp(`${escapeRegex(suffix)}$`);

	return routeId
		.replace(re, '') // remove suffix
		.replace(/^\/+/, ''); // remove leading slash
}
