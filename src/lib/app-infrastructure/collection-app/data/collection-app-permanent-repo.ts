import { Dexie, type EntityTable } from 'dexie';
import type {
	AllRecordsProjections,
	AppRecordRepo,
	CollectionAppDbRecord,
	CollectionAppRecord,
	DataProjection,
	DbAdapter,
	DbItem,
	RecordKeys,
	RecordProjection,
	SyncableAppRecordMetadata
} from './types';
import type { ActionResult, CollectionAppContext, CollectionAppError } from '../types';
import { getNextSlug, slugify } from './slugify';
import { getErrorMessage } from '$lib/engine/general-js-ts/extract-error-message';

class CollectionAppDexieRepo<
	TData extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> extends Dexie {
	data!: EntityTable<DbItem<TData>, 'recordId'>;
	projection!: EntityTable<DbItem<TProjection>, 'recordId'>;
	metadata!: EntityTable<DbItem<SyncableAppRecordMetadata>, 'recordId'>;
	keys!: EntityTable<DbItem<RecordKeys>, 'recordId'>;

	constructor(dbName: string) {
		super(dbName);

		this.version(1).stores({
			data: 'recordId',
			projection: 'recordId',
			metadata: 'recordId',
			keys: 'recordId, &slug'
		});
	}
}

export class CollectionAppPermanentRepo<
	TData extends Omit<object, 'recordId'>,
	TProjection extends DataProjection
> implements AppRecordRepo<TData, TProjection, SyncableAppRecordMetadata, CollectionAppError>
{
	#dexieRepo: CollectionAppDexieRepo<TData, TProjection>;
	#adapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>;

	constructor(dbName: string, dbAdapter: DbAdapter<TData, TProjection, SyncableAppRecordMetadata>) {
		this.#dexieRepo = new CollectionAppDexieRepo(dbName);
		this.#adapter = dbAdapter;
	}

	async create(
		context: CollectionAppContext,
		data: TData,
		newItemDisplayName: string,
		precalculatedSlug?: string
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const db = this.#dexieRepo;
		let record = this.#adapter.constructRecord(data, newItemDisplayName);

		console.log('Repo Create - Assigning New Item Slug. displayName:', newItemDisplayName);
		let slug: string;
		if (precalculatedSlug) {
			slug = precalculatedSlug;
		} else {
			slug = await this.getSlug(newItemDisplayName);
		}
		console.log(
			`Repo Create - Created New Item Slug. displayName: [${newItemDisplayName}], slug: [${slug}]`
		);
		record.slug = slug;

		let dbRecord = this.#adapter.toDbObject(record);

		console.log('create - dbRecord', dbRecord);

		let { recordId } = dbRecord;

		try {
			await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				await db.keys.add({ ...dbRecord.keys, recordId });
				await db.data.add({ ...dbRecord.data, recordId });
				await db.projection.add({ ...dbRecord.projection, recordId });
				await db.metadata.add({ ...dbRecord.meta, recordId });
			});

			return { ok: true, value: this.#adapter.fromDbObject(dbRecord) };
		} catch (e) {
			if (e instanceof Dexie.ConstraintError) {
				console.warn('Create, got ConstraintError', e);
				return {
					ok: false,
					error: {
						kind: 'Key Already Exists',
						message: `Slug: [${dbRecord.recordId}] already exists. displayName: [${dbRecord.projection.displayName}]. data: [${JSON.stringify(record.data)}]`,
						context
					}
				};
			} else {
				console.error('Error on create', e);
				throw e;
			}
		}
	}

	async update(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>
	): Promise<ActionResult<CollectionAppRecord<TData, TProjection>, CollectionAppError>> {
		const db = this.#dexieRepo;
		let dbRecord = this.#adapter.toDbObject(record);

		console.log('Dexie Repo Update:', record);

		let { recordId } = dbRecord;

		try {
			// TODO AZ Add slug

			await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				await db.keys.put({ ...dbRecord.keys, recordId });
				await db.data.put({ ...dbRecord.data, recordId });
				await db.projection.put({ ...dbRecord.projection, recordId });
				await db.metadata.put({ ...dbRecord.meta, recordId });
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

	async delete(
		context: CollectionAppContext,
		record: CollectionAppRecord<TData, TProjection>
	): Promise<ActionResult<void, CollectionAppError>> {
		const db = this.#dexieRepo;
		let dbRecord = this.#adapter.toDbObject(record);

		console.log('Permanent Repo - Deleting item. Context:', context, 'record:', dbRecord);

		let { recordId } = dbRecord;

		try {
			await db.transaction('rw', db.data, db.projection, db.metadata, db.keys, async () => {
				await db.keys.delete(recordId);
				await db.data.delete(recordId);
				await db.projection.delete(recordId);
				await db.metadata.delete(recordId);
			});

			console.log(
				'Permanent Repo - Succesfully deleted item. Context:',
				context,
				'record:',
				dbRecord
			);

			return { ok: true, value: undefined };
		} catch (e) {
			if (e instanceof Dexie.NotFoundError) {
				console.warn('Permanent Repo - Delete, Record Not found', e);
				return {
					ok: false,
					error: {
						kind: 'Key Not Found',
						message: `Item Key: [${record.slug}] already exists. data: [${JSON.stringify(record.data)}]`,
						context
					}
				};
			} else {
				throw e;
			}
		}
	}

	async load(
		context: CollectionAppContext
	): Promise<
		ActionResult<CollectionAppRecord<TData, TProjection> | undefined, CollectionAppError>
	> {
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
				const metaRow = await db.metadata.get(
					recordId as DbItem<SyncableAppRecordMetadata>['recordId']
				);

				console.log('metaRow for id', recordId, 'row', metaRow);

				if (!dataRow || !metaRow) {
					return {
						ok: false,
						error: {
							kind: 'Corrupted Record',
							message: `Projection for slug [${slug}] exists, but matching data or meta, or projectionRow is missing. dataRow: [${dataRow}], metaRow: [${metaRow}, projectionRow: [${projectionRow}]`,
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
		ActionResult<
			AllRecordsProjections<TData, TProjection, SyncableAppRecordMetadata>,
			CollectionAppError
		>
	> {
		const db = this.#dexieRepo;

		return await db.transaction('r', db.projection, db.metadata, db.keys, async () => {
			const [projectionRows, metaRows, keysRows] = await Promise.all([
				db.projection.toArray(),
				db.metadata.toArray(),
				db.keys.toArray()
			]);

			const metaByRecordId = new Map(metaRows.map((row) => [row.recordId, stripRecordId(row)]));
			const keysByRecordId = new Map(keysRows.map((row) => [row.recordId, stripRecordId(row)]));

			const allProjections: AllRecordsProjections<TData, TProjection, SyncableAppRecordMetadata> =
				projectionRows
					.map((projectionRow) => {
						const meta = metaByRecordId.get(projectionRow.recordId);
						const keys = keysByRecordId.get(projectionRow.recordId);

						if (!meta || !keys) {
							console.error(
								`Corrupted record: projection exists for recordId [${projectionRow.recordId}] but metadata or keys are missing, meta: [${meta}], keys: [${keys}]`
							);
							return undefined;
						}

						return {
							recordId: projectionRow.recordId,
							projection: stripRecordId(projectionRow),
							slug: keys.slug,
							meta
						};
					})
					.filter(
						(item): item is RecordProjection<TData, TProjection, SyncableAppRecordMetadata> =>
							item !== undefined
					);

			return {
				ok: true,
				value: allProjections
			};
		});
	}

	async getSlug(displayName: string, prevSlug?: string): Promise<string> {
		let baseSlug = slugify(displayName);

		// "baseSlug[-###]"
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
