import { goto } from '$app/navigation';
import { page } from '$app/state';
import { getBasePath, getContextPath } from '$lib/engine/routing/routing-helps';
import { track } from '$lib/engine/svelte-helpers/track.svelte';
import { untrack } from 'svelte';
import type {
	CollectionAppContext,
	CollectionAppContextChangeEvent,
	CollectionAppContextManager,
	EditMode as CollectionAppEditMode,
	ContextChangeEventKind
} from './types';

const DRAFT_ITEM_KEY = '_draft_';

export function ctxEquals(ctx1: CollectionAppContext, ctx2: CollectionAppContext) {
	return ctx1.slug === ctx2.slug;
}

export function createCollectionAppContextManager<
	TContext extends CollectionAppContext
>(): CollectionAppContextManager<TContext> {
	function getItemKeyFromSlug() {
		console.log('page params', page.params);

		return page.params.itemKey;
	}

	let _slugItemKey = $state(getItemKeyFromSlug());
	let _displayName: string | undefined = $state();

	let _slug = $derived(_slugItemKey ? _slugItemKey : DRAFT_ITEM_KEY);
	let _editMode = $derived<CollectionAppEditMode>(_slug === DRAFT_ITEM_KEY ? 'draft' : 'permanent');

	let _baseUrlPath = getBasePath('[[itemKey]]');
	let appContextChangeEvent: CollectionAppContextChangeEvent | undefined = $state();

	let appContext = $state({
		get slug() {
			return _slug;
		},
		get editMode() {
			return _editMode;
		},
		get displayName() {
			return _displayName;
		}
	}) as TContext;

	let _projectedSlug = $state<string | null>(null);
	let _projectedEditMode = $derived<CollectionAppEditMode>(
		_projectedSlug === DRAFT_ITEM_KEY ? 'draft' : 'permanent'
	);

	$effect(() => {
		console.log('_slugItemKey:', _slugItemKey);
	});

	// TODO AZ sort this chaos
	let projectedContext = $derived.by(() =>
		_slugItemKey
			? {
					get slug() {
						return _projectedSlug;
					},
					get editMode() {
						return _projectedEditMode;
					}
				}
			: undefined
	) as TContext;

	const emitContextChange = (
		newContext: CollectionAppContext,
		prevContext: CollectionAppContext,
		eventKind: ContextChangeEventKind
	) => {
		if (prevContext.slug != newContext.slug) {
			appContextChangeEvent = {
				kind: eventKind,
				prevContext: prevContext,
				newContext: $state.snapshot(newContext)
			};

			console.log('detected route change, emitting', $state.snapshot(appContextChangeEvent));
		}
	};

	$effect(() => {
		track(page.url);

		untrack(() => {
			let prevContext = $state.snapshot(appContext);
			_slugItemKey = getItemKeyFromSlug();

			emitContextChange(appContext, prevContext, 'browser-navigation');
		});
	});

	return {
		get appContext() {
			return appContext;
		},
		get appContextChangeEvent() {
			return appContextChangeEvent;
		},
		get projectedContext() {
			return projectedContext;
		},
		changeContext(slugItemKey: string, displayName?: string) {
			let undoChangeContext = () => {
				console.warn('undoChangeContext Ignored change was in place');
			};

			if (_slugItemKey != slugItemKey) {
				let prevContext = $state.snapshot(appContext);
				console.log('changing context', 'new itemKey', slugItemKey, 'prevContext', prevContext);

				_slugItemKey = slugItemKey;
				_displayName = displayName;
				emitContextChange(appContext, prevContext, 'browser-navigation');

				goto(getContextPath(_baseUrlPath, _slugItemKey));

				undoChangeContext = () => {
					console.warn(
						'Undoing Context Change new Key:',
						prevContext.slug,
						'prev itemKey',
						slugItemKey
					);

					goto(getContextPath(_baseUrlPath, prevContext.slug), { replaceState: true });
				};
			}

			return {
				undoChangeContext
			};
		},
		get baseUrlPath() {
			return _baseUrlPath;
		},
		replaceContext(prevContext: TContext, newItemSlug, newItemDisplayName?: string) {
			if (ctxEquals(prevContext, appContext)) {
				goto(getContextPath(_baseUrlPath, newItemSlug), { replaceState: true });
			} else {
				console.warn(
					'Tried to replace *stale* context Ignoring Replace Context... context for replacement',
					prevContext,
					'new itemKey',
					newItemSlug,
					'current context:',
					appContext
				);
			}
			// TODO AZ make a cache for non current context changes so it can be changed on history navigation
		},
		changeProjectedContext(itemKey: string) {
			_projectedSlug = itemKey;
		},
		resetProjectedContext() {
			_projectedSlug = null;
		}
	};
}
