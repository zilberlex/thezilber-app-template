import { ItemCache } from './cache';
import type { CollectionAppRecord, CollectionAppRecordProjection, DataProjection } from './data/types';
import { SvelteTouchMap } from './touch-map.svelte';
import type { CollectionAppLoadResult } from './types';

export class CollectionAppCache<T, TProjection extends DataProjection> {
	#fetchFunciton: (slug: string) => Promise<CollectionAppLoadResult<CollectionAppRecord<T, TProjection>>>;
	#cache: ItemCache<string, CollectionAppRecord<T, TProjection>>;
	#recordProjections: SvelteTouchMap<string, CollectionAppRecordProjection<T, TProjection>>;

	constructor(fetchFunciton: (slug: string) => Promise<CollectionAppLoadResult<CollectionAppRecord<T, TProjection>>>) {
		this.#cache = new ItemCache();
		this.#recordProjections = new SvelteTouchMap('prepend');
		this.#fetchFunciton = fetchFunciton;
	}

	async getRecord(slug: string): Promise<CollectionAppLoadResult<CollectionAppRecord<T, TProjection>>> {
		let record = this.#cache.get(slug);

		if (!record) {
			// Non-Cached Flow
			let fetchResult = await this.#fetchFunciton(slug);
			if (fetchResult.ok) {
				record = fetchResult.value;

				if (record) {
					this.updateRecordCache(record);
				}
			} else {
				// Error Retrieving record
				return fetchResult;
			}
		}

		return {
			ok: true,
			value: record
		};
	}

	updateRecordCache(record: CollectionAppRecord<T, TProjection>, oldSlug?: string) {
		let slug = record.slug;
		this.#cache.setOrUpdateKey(slug, record, oldSlug);
		let { data, ...rest } = record;
		let recordProjection = rest;

		this.updateProjection(slug, recordProjection, oldSlug);
		this.#recordProjections.set(record.slug, recordProjection);
		if (oldSlug) {
			this.#recordProjections.delete(oldSlug);
		}
	}

	updateProjection(slug: string, projection: CollectionAppRecordProjection<T, TProjection>, oldSlug?: string) {
		this.#recordProjections.set(slug, projection);
		if (oldSlug) {
			this.#recordProjections.delete(oldSlug);
		}
	}

	deleteRecord(slug: string) {
		let prevRecord = this.#cache.get(slug);
		let prevProjection = this.#recordProjections.get(slug);
		let undoOp = () => {
			console.log('Cache - Undo Delte Record', { slug, prevRecord, prevProjection });
			if (prevRecord && prevProjection) {
				this.#cache.setOrUpdateKey(slug, prevRecord);
				this.#recordProjections.set(slug, prevProjection);
			}
		};

		this.#cache.delete(slug);
		this.#recordProjections.delete(slug);

		return undoOp;
	}

	get projections() {
		return this.#recordProjections;
	}
}
