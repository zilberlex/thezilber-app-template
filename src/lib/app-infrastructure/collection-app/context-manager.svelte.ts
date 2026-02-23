import { goto, pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { getBasePath, getContextPath } from '$lib/engine/routing/routing-helps';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { untrack } from 'svelte';

type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	// Tech Debt
	appContextChangeEvent: CollectionAppContextChangeEvent | undefined;
	moveRouteRelative: (itemKey: string) => { undoMoveRoute: () => void };
};

const DRAFT_ITEM_KEY = '_draft_';

export function createCollectionAppContextManager<
	TContext extends CollectionAppContext
>(): CollectionAppContextManager<TContext> {
	function getItemKey() {
		return page.params.itemKey;
	}

	let slugItemKey = getItemKey();
	let _itemKey = $state(slugItemKey ?? DRAFT_ITEM_KEY);
	let _editMode: EditMode = $derived(_itemKey === DRAFT_ITEM_KEY ? 'draft' : 'permanent');
	let _baseUrlPath = getBasePath('[[itemKey]]');
	let appContextChangeEvent: CollectionAppContextChangeEvent | undefined = $state();

	let appContext = $state({
		get itemKey() {
			return _itemKey;
		},
		get editMode() {
			return _editMode;
		}
	}) as TContext;

	$effect(() => {
		track(page.url);

		untrack(() => {
			let itemKey = getItemKey() ?? DRAFT_ITEM_KEY;
			let prevContext = { ...appContext };

			_itemKey = itemKey;

			appContextChangeEvent = {
				kind: 'browser-navigation',
				prevContext: prevContext,
				newContext: { ...appContext }
			};
			console.log('detected route change, emitting', $state.snapshot(appContextChangeEvent));
		});
	});

	console.log('initiated context', $state.snapshot(appContext));

	return {
		get appContext() {
			return appContext;
		},
		get appContextChangeEvent() {
			return appContextChangeEvent;
		},
		moveRouteRelative(itemKey: string) {
			let prevContext = { ...appContext };
			let prevState = page.state;

			_itemKey = itemKey;
			// TODO AZ make better logic with encapsulated when key changes. push state and replace state
			goto(getContextPath(_baseUrlPath, _itemKey));

			return {
				undoMoveRoute: () => {
					_itemKey = prevContext.itemKey;
					goto(getContextPath(_baseUrlPath, _itemKey));
				}
			};
		}
	};
}
