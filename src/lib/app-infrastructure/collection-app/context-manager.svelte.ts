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
	replaceContext: (prevContext: TContext, newItemKey: string) => void;
};

const DRAFT_ITEM_KEY = '_draft_';

export function ctxEquals(ctx1: CollectionAppContext, ctx2: CollectionAppContext) {
	return ctx1.itemKey === ctx2.itemKey;
}

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
			console.log('changing context', 'new itemKey', itemKey, 'prevContext', prevContext);

			_itemKey = itemKey;
			goto(getContextPath(_baseUrlPath, _itemKey));

			return {
				undoChangeContext: () => {
					console.warn(
						'Undoing Context Change new Key:',
						prevContext.itemKey,
						'prev itemKey',
						itemKey
					);

					goto(getContextPath(_baseUrlPath, prevContext.itemKey), { replaceState: true });
				}
			};
		},
		replaceContext(prevContext: TContext, newItemKey) {
			if (ctxEquals(prevContext, appContext)) {
				goto(getContextPath(_baseUrlPath, newItemKey), { replaceState: true });
			} else {
				console.warn(
					'Tried to replace *stale* context Ignoring Replace Context... context for replacement',
					prevContext,
					'new itemKey',
					newItemKey,
					'current context:',
					appContext
				);
			}
			// TODO AZ make a cache for non current context changes so it can be changed on history navigation
		}
	};
}
