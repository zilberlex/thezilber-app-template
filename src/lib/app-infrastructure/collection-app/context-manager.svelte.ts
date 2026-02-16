import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { getBasePath } from '$lib/engine/routing/routing-helps';

type CollectionAppContextManager<TContext extends CollectionAppContext> = {
	appContext: TContext;
	moveRouteRelative: (itemKey: string) => { undoMoveRoute: () => void };
};

function getNewPath(baseUrlPath: string, itemKey: string) {
	const newUrl = new URL(page.url);
	newUrl.pathname = `${baseUrlPath}/${itemKey}`;

	return newUrl;
}

export function createCollectionAppContextManager<
	TContext extends CollectionAppContext
>(): CollectionAppContextManager<TContext> {
	let slugItemKey = page.params.itemKey;

	let _itemKey = $state(slugItemKey ?? '_draft_');
	let _editMode: EditMode = $derived(_itemKey === '_draft_' ? 'draft' : 'permanent');
	let _baseUrlPath = getBasePath(page, '[[itemKey]]');

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

			_itemKey = itemKey;
			// TODO AZ make better logic with encapsulated when key changes. push state and replace state
			pushState(getNewPath(_baseUrlPath, _itemKey), { itemKey });

			return {
				undoMoveRoute: () => {
					_itemKey = prevContext.itemKey;
					replaceState(getNewPath(_baseUrlPath, _itemKey), prevState);
				}
			};
		}
	};
}
