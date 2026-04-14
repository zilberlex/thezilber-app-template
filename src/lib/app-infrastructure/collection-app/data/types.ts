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

export type CollectionAppRecord<TData, TProjection> = AppRecord<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

export type CollectionAppDbRecord<TData, TProjection> = DbAppRecord<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

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

export type AllRecordsProjections<
	TData,
	TProjection extends DataProjection,
	TMeta
> = RecordProjection<TData, TProjection, TMeta>[];

export interface DbAdapter<TData, TProjection extends DataProjection, TMeta> {
	constructRecord(data: TData, newItemKey?: string): AppRecord<TData, TProjection, TMeta>;
	projectionFromData(data: TData): TProjection;
	toDbObject(record: AppRecord<TData, TProjection, TMeta>): DbAppRecord<TData, TProjection, TMeta>;
	fromDbObject(
		dbRecord: DbAppRecord<TData, TProjection, TMeta>
	): AppRecord<TData, TProjection, TMeta>;
	refreshProjection(
		record: AppRecord<TData, TProjection, TMeta>
	): AppRecord<TData, TProjection, TMeta>;
}

export type CollectionAppDbAdapter<TData, TProjection extends DataProjection> = DbAdapter<
	TData,
	TProjection,
	SyncableAppRecordMetadata
>;

export interface AppRecordRepo<TData, TProjection extends DataProjection, TMeta, TError> {
	create(
		context: CollectionAppContext,
		data: TData,
		newItemKey: string,
		precalculatedSlug?: string
	): Promise<ActionResult<AppRecord<TData, TProjection, TMeta>, TError>>;

	update(
		context: CollectionAppContext,
		record: AppRecord<TData, TProjection, TMeta>
	): Promise<ActionResult<AppRecord<TData, TProjection, TMeta>, TError>>;

	load(
		context: CollectionAppContext
	): Promise<ActionResult<AppRecord<TData, TProjection, TMeta> | undefined, TError>>;

	delete(
		context: CollectionAppContext,
		record: AppRecord<TData, TProjection, TMeta>
	): Promise<ActionResult<void, TError>>;

	getAllRecordProjections(): Promise<
		ActionResult<AllRecordsProjections<TData, TProjection, TMeta>, TError>
	>;

	getSlug(displayName: string, prevSlug?: string): Promise<string>;
}

export type DataProjection = { displayName: string };
