import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getBasePath, getContextPath } from '$lib/engine/routing/routing-helps';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { untrack } from 'svelte';

type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	// Tech Debt
	appContextChangeEvent: CollectionAppContextChangeEvent | undefined;
	changeContext: (itemKey: string) => { undoChangeContext: () => void };
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
			let prevContext = $state.snapshot(appContext);

			_itemKey = itemKey;

			appContextChangeEvent = {
				kind: 'browser-navigation',
				prevContext: prevContext,
				newContext: $state.snapshot(appContext)
			};
			console.log('detected route change, emitting', $state.snapshot(appContextChangeEvent));
		});
	});

	return {
		get appContext() {
			return appContext;
		},
		get appContextChangeEvent() {
			return appContextChangeEvent;
		},
		changeContext(itemKey: string) {
			let prevContext = { ...appContext };

			_itemKey = itemKey;
			goto(getContextPath(_baseUrlPath, _itemKey));

			return {
				undoChangeContext: () => {
					goto(getContextPath(_baseUrlPath, prevContext.itemKey), { replaceState: true });
				}
			};
		}
	};
}
