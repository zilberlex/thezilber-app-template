import type { ActionResult, CollectionAppContext } from '../types';

type DeviceId = string;
export type VectorClock = Record<DeviceId, number>;

export type DbItem<TItem> = Omit<TItem, 'recordId'> & { recordId: string };

export interface AppRecord<TData, TProjection, TMeta> {
	recordId: string;
	slug: string;
	meta: TMeta;
	data: TData;
	projection: TProjection;
}

export interface DbAppRecord<TData, TProjection, TMeta> {
	recordId: string;
	meta: TMeta;
	data: TData;
	projection: TProjection;
	keys: RecordKeys;
}

export type CollectionAppRecord<TData, TProjection> = AppRecord<TData, TProjection, SyncableAppRecordMetadata>;

export type CollectionAppRecordProjection<TData, TProjection extends DataProjection> = RecordProjection<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

export type CollectionAppDbRecord<TData, TProjection> = DbAppRecord<TData, TProjection, SyncableAppRecordMetadata>;

export type CollectionAppStoreItem<TData, TProjection extends DataProjection> =
	| CollectionAppRecordProjection<TData, TProjection>
	| CollectionAppRecord<TData, TProjection>;

export type SyncableAppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

export type RecordKeys = {
	slug: string;
};

export type RecordProjection<TData, TProjection extends DataProjection, TMeta> = Omit<
	AppRecord<TData, TProjection, TMeta>,
	'data'
>;

export type AllRecordsProjections<TData, TProjection extends DataProjection, TMeta> = RecordProjection<
	TData,
	TProjection,
	TMeta
>[];

export type GetSlugResult = {
	actualSlugPromise: Promise<string>;
};

export interface DbAdapter<TData, TProjection extends DataProjection, TMeta> {
	constructRecord(data: TData, newItemKey?: string): AppRecord<TData, TProjection, TMeta>;
	projectionFromData(data: TData): TProjection;
	toDbObject(record: AppRecord<TData, TProjection, TMeta>): DbAppRecord<TData, TProjection, TMeta>;
	fromDbObject(dbRecord: DbAppRecord<TData, TProjection, TMeta>): AppRecord<TData, TProjection, TMeta>;
	refreshProjection(record: AppRecord<TData, TProjection, TMeta>): AppRecord<TData, TProjection, TMeta>;
	renameData(data: TData, displayName: string): TData;
	getDisplayName(data: TData): string;
}

export type CollectionAppDbAdapter<TData, TProjection extends DataProjection> = DbAdapter<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

export type CollectionAppSaveOperationResult<T> = {
	resultPromise: Promise<T>;
};

export interface AppRecordRepo<TData, TProjection extends DataProjection, TMeta, TError> {
	create(
		context: CollectionAppContext,
		data: TData,
		newDisplayName: string,
		precalculatedSlug?: string
	): CollectionAppSaveOperationResult<ActionResult<AppRecord<TData, TProjection, TMeta>, TError>>;

	update(
		context: CollectionAppContext,
		record: AppRecord<TData, TProjection, TMeta>
	): CollectionAppSaveOperationResult<ActionResult<AppRecord<TData, TProjection, TMeta>, TError>>;

	load(context: CollectionAppContext): Promise<ActionResult<AppRecord<TData, TProjection, TMeta> | undefined, TError>>;

	delete(context: CollectionAppContext): Promise<ActionResult<void, TError>>;

	rename(
		context: CollectionAppContext,
		displayName: string
	): CollectionAppSaveOperationResult<ActionResult<AppRecord<TData, TProjection, TMeta>, TError>>;

	getAllRecordProjections(): Promise<ActionResult<AllRecordsProjections<TData, TProjection, TMeta>, TError>>;
}

export type DataProjection = { displayName: string };
