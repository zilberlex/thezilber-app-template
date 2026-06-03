import { Dexie, type EntityTable } from 'dexie';
import type {
	AllRecordsProjections,
	AppRecordRepo,
	CollectionAppDbRecord,
	CollectionAppRecord,
	CollectionAppSaveOperationResult,
	DataProjection,
	DbAdapter,
	DbItem,
	GetSlugResult,
	RecordKeys,
	RecordProjection,
	SyncableAppRecordMetadata
} from './types';
import type { ActionResult, CollectionAppBlankResult, CollectionAppContext, CollectionAppError } from '../types';
import { getNextSlug, slugify } from './slugify';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';

class CollectionAppDexieRepo<TData extends Omit<object, 'recordId'>, TProjection extends DataProjection> extends Dexie {
	data!: EntityTable<DbItem<TData>, 'recordId'>;
	projection!: EntityTable<DbItem<TProjection>, 'recordId'>;
	metadata!: EntityTable<DbItem<SyncableAppRecordMetadata>, 'recordId'>;
	keys!: EntityTable<DbItem<RecordKeys>, 'recordId'>;

	constructor(dbName: string) {
		super(dbName);

		this.version(1).stores({
			data: 'recordId',
			projection: 'recordId',
			metadata: 'recordId, [modifiedAt+recordId]',
			keys: 'recordId, &slug'
		});
	}
}

export class CollectionAppPermanentRepo<
	TData extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> implements AppRecordRepo<TData, TProjection, SyncableAppRecordMetadata, CollectionAppError> {
	#dexieRepo: CollectionAppDexieRepo<TData, TProjection>;
	#adapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>;

	constructor(dbName: string, dbAdapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>) {
		this.#dexieRepo = new CollectionAppDexieRepo(dbName);
		this.#adapter = dbAdapter;
	}

	create(
		context: CollectionAppContext,
		data: TData,
		newItemDisplayName: string
	): CollectionAppSaveOperationResult<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		let { optimisticSlug, actualSlugPromise } = this.getSlug(newItemDisplayName);
		let record = this.#adapter.constructRecord(data, newItemDisplayName);

		return {
			optimisticSlug,
			resultPromise: this.#createInternal(context, record, actualSlugPromise)
		};
	}

	async #createInternal(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>,
		actualSlugPromise: Promise<string>
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const db = this.#dexieRepo;

		let newSlug = await actualSlugPromise;
		record.slug = newSlug;
		let dbRecord = this.#adapter.toDbObject(record);

		try {
			await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				console.log('create - dbRecord', dbRecord);

				let { recordId } = dbRecord;

				Promise.all([
					db.keys.add({ ...dbRecord.keys, recordId }),
					db.data.add({ ...dbRecord.data, recordId }),
					db.projection.add({ ...dbRecord.projection, recordId }),
					db.metadata.add({ ...dbRecord.meta, recordId })
				]);
			});

			return { ok: true, value: this.#adapter.fromDbObject(dbRecord) };
		} catch (e) {
			if (e instanceof Dexie.ConstraintError) {
				console.warn('Create, got ConstraintError', e);
				return {
					ok: false,
					error: {
						kind: 'Key Already Exists',
						message: `Slug: [${dbRecord.keys.slug}] already exists. displayName: [${dbRecord.projection.displayName}]. data: [${JSON.stringify(record.data)}]`,
						context
					}
				};
			} else {
				console.error('Error on create', e);
				throw e;
			}
		}
	}

	update(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>
	): CollectionAppSaveOperationResult<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		let { optimisticSlug, actualSlugPromise } = this.getSlug(record.projection.displayName, context.slug);

		return {
			optimisticSlug,
			resultPromise: this.#updateInternal(context, record, actualSlugPromise)
		};
	}

	async #updateInternal(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>,
		actualSlugPromise: Promise<string>
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const db = this.#dexieRepo;

		let newSlug = await actualSlugPromise;
		record.slug = newSlug;
		let dbRecord = this.#adapter.toDbObject(record);

		console.log('Dexie Repo Update:', record);

		let { recordId } = dbRecord;

		try {
			await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				await Promise.all([
					db.keys.put({ ...dbRecord.keys, recordId }),
					db.data.put({ ...dbRecord.data, recordId }),
					db.projection.put({ ...dbRecord.projection, recordId }),
					db.metadata.put({ ...dbRecord.meta, recordId })
				]);
			});

			return { ok: true, value: this.#adapter.fromDbObject(dbRecord) };
		} catch (e) {
			console.error('error on update', e);
			return {
				ok: false,
				error: { kind: 'General Error', message: getErrorMessage(e), context }
			};
		}
	}

	rename(
		context: CollectionAppContext,
		displayName: string
	): CollectionAppSaveOperationResult<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const { slug } = context;
		let { optimisticSlug, actualSlugPromise } = this.getSlug(displayName, slug);

		let renameResultExecute = async () => {
			return await this.#renameInternal(context, displayName, await actualSlugPromise);
		};

		return {
			optimisticSlug,
			resultPromise: renameResultExecute()
		};
	}

	async #renameInternal(
		context: CollectionAppContext,
		newName: string,
		newSlug: string
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const db = this.#dexieRepo;
		const { slug } = context;
		try {
			return await db.transaction('rw', db.keys, db.data, db.projection, db.metadata, async () => {
				const keysRow = await db.keys.where('slug').equals(slug).first();

				if (!keysRow) {
					return {
						ok: false,
						error: {
							kind: 'Key Not Found',
							message: `Cant find record with slug [${slug}].`,
							context
						}
					};
				}

				const { recordId } = keysRow;

				const [dataRow, metaRow] = await Promise.all([db.data.get(recordId), db.metadata.get(recordId)]);

				if (!dataRow || !metaRow) {
					return {
						ok: false,
						error: {
							kind: 'Corrupted Record',
							message: `Keys row for slug [${slug}] exists, but data or metadata is missing.`,
							context
						}
					};
				}

				const oldData = stripRecordId(dataRow);
				const oldMeta = stripRecordId(metaRow);
				const oldKeys = stripRecordId(keysRow);

				const newData = this.#adapter.renameData(oldData, newName);
				const newProjection = this.#adapter.projectionFromData(newData);

				const dbRecord: CollectionAppDbRecord<TData, TProjection> = {
					recordId,
					data: newData,
					projection: newProjection,
					meta: {
						...oldMeta,
						modifiedAt: Date.now()
					},
					keys: {
						...oldKeys,
						slug: newSlug
					}
				};

				await Promise.all([
					db.keys.put({ ...dbRecord.keys, recordId }),
					db.data.put({ ...dbRecord.data, recordId }),
					db.projection.put({ ...dbRecord.projection, recordId }),
					db.metadata.put({ ...dbRecord.meta, recordId })
				]);

				return {
					ok: true,
					value: this.#adapter.fromDbObject(dbRecord)
				};
			});
		} catch (e) {
			return {
				ok: false,
				error: {
					kind: 'General Error',
					message: getErrorMessage(e),
					context
				}
			};
		}
	}

	async delete(context: CollectionAppContext): Promise<ActionResult<void, CollectionAppError>> {
		const db = this.#dexieRepo;
		const { slug } = context;

		try {
			return await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				const keysRow = await db.keys.where('slug').equals(slug).first();

				if (!keysRow) {
					return {
						ok: false,
						error: {
							kind: 'Key Not Found',
							message: `Cant find record with slug [${slug}].`,
							context
						}
					};
				}

				const { recordId } = keysRow;

				await Promise.all([
					db.keys.delete(recordId),
					db.data.delete(recordId),
					db.projection.delete(recordId),
					db.metadata.delete(recordId)
				]);

				return { ok: true, value: undefined };
			});
		} catch (e) {
			return {
				ok: false,
				error: {
					kind: 'General Error',
					message: getErrorMessage(e),
					context
				}
			};
		}
	}
	async load(
		context: CollectionAppContext
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection> | undefined, CollectionAppError>> {
		const db = this.#dexieRepo;
		const slug = context.slug;

		try {
			return await db.transaction('r', db.projection, db.data, db.metadata, db.keys, async () => {
				const keysRow = (await db.keys.where('slug').equals(slug).first()) as DbItem<RecordKeys>;

				if (!keysRow) {
					return { ok: true, value: undefined };
				}

				const { recordId } = keysRow;

				const dataRow = await db.data.get(recordId as DbItem<TData>['recordId']);
				const metaRow = await db.metadata.get(recordId as DbItem<SyncableAppRecordMetadata>['recordId']);

				console.log('metaRow for id', recordId, 'row', metaRow);

				if (!dataRow || !metaRow) {
					return {
						ok: false,
						error: {
							kind: 'Corrupted Record',
							message: `Keys row for slug [${slug}] exists, but matching data or meta is missing. dataRow: [${dataRow}], metaRow: [${metaRow}]`,
							context
						}
					};
				}

				let data = stripRecordId(dataRow);
				let projection = this.#adapter.projectionFromData(data);
				let meta = stripRecordId(metaRow);
				let keys = stripRecordId(keysRow);

				const dbRecord: CollectionAppDbRecord<TData, TProjection> = {
					recordId,
					data,
					projection,
					meta,
					keys
				};

				console.log('Loaded Db Item - ', dbRecord);

				return {
					ok: true,
					value: this.#adapter.fromDbObject(dbRecord)
				};
			});
		} catch (e) {
			let message = 'Unknown Error';
			if (e instanceof Error) message = e.message;
			return {
				ok: false,
				error: { context, kind: 'General Error', message }
			};
		}
	}

	async getAllRecordProjections(): Promise<
		ActionResult<AllRecordsProjections<TData, TProjection, SyncableAppRecordMetadata>, CollectionAppError>
	> {
		const db = this.#dexieRepo;

		return await db.transaction('r', db.projection, db.metadata, db.keys, async () => {
			const metaRows = await db.metadata.orderBy('modifiedAt').reverse().toArray();

			const recordIds = metaRows.map((row) => row.recordId);

			const [projectionRows, keysRows] = await Promise.all([
				db.projection.bulkGet(recordIds),
				db.keys.bulkGet(recordIds)
			]);

			const projectionByRecordId = new Map(
				projectionRows.filter((row): row is DbItem<TProjection> => row !== undefined).map((row) => [row.recordId, row])
			);

			const keysByRecordId = new Map(
				keysRows.filter((row): row is DbItem<RecordKeys> => row !== undefined).map((row) => [row.recordId, row])
			);

			const allProjections: AllRecordsProjections<TData, TProjection, SyncableAppRecordMetadata> = metaRows
				.map((metaRow) => {
					const projectionRow = projectionByRecordId.get(metaRow.recordId);
					const keysRow = keysByRecordId.get(metaRow.recordId);

					if (!projectionRow || !keysRow) {
						console.error(
							`Corrupted record: metadata exists for recordId [${metaRow.recordId}] but projection or keys are missing. projection: [${projectionRow}], keys: [${keysRow}]`
						);
						return undefined;
					}

					return {
						recordId: metaRow.recordId,
						projection: stripRecordId(projectionRow),
						slug: keysRow.slug,
						meta: stripRecordId(metaRow)
					};
				})
				.filter((item): item is RecordProjection<TData, TProjection, SyncableAppRecordMetadata> => item !== undefined);

			return {
				ok: true,
				value: allProjections
			};
		});
	}

	getSlug(displayName: string, prevSlug?: string): GetSlugResult {
		let baseSlug = slugify(displayName);

		return {
			optimisticSlug: baseSlug,
			actualSlugPromise: this.#getFinalSlug(baseSlug, prevSlug)
		};
	}

	async #getFinalSlug(baseSlug: string, prevSlug?: string) {
		const slugPattern = new RegExp(`^${baseSlug}(?:-\\d+)?$`);

		if (prevSlug && slugPattern.test(prevSlug)) {
			console.log(
				`Generate Slug - Slug not recalculated as prev slug matches displayName slug signature. prevSlug: [${prevSlug}], displayName: [${displayName}], baseSlug from displayName: [${baseSlug}]`
			);

			return prevSlug;
		}

		const db = this.#dexieRepo;

		const matches = await db.keys
			.where('slug')
			.between(baseSlug, baseSlug + '\uffff', true, true)
			.toArray();

		const relevantSlugs = matches
			.map((item) => item.slug)
			.filter((slug) => slug === baseSlug || slug.startsWith(baseSlug + '-'));

		let slug = getNextSlug(baseSlug, relevantSlugs);

		return slug;
	}
}

function stripRecordId<T>(row: DbItem<T>): T {
	const { recordId: _, ...rest } = row;
	return rest as T;
}
