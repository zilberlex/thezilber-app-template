import { createSyncableRecordMetadata } from '$lib/app-infrastructure/collection-app/data';
import type {
	CollectionAppEnvironment,
	CollectionAppRecord
} from '$lib/app-infrastructure/collection-app/types';
import type { DynamicForm } from '$lib/app/dynamic-form/dynamic-form-types';
import type {
	DataProjection,
	DbAppRecord,
	RecordProjection,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';

export type CbData = {
	commandName: string;
	commandStr: string;
	formData: DynamicForm;
};
export type CbProjection = {
	commandName: string;
} & DataProjection;

export type CbRecord = CollectionAppRecord<CbData, CbProjection>;
export type CbRecordProjection = RecordProjection<CbData, CbProjection, SyncableAppRecordMetadata>;

export type DbCbRecord = DbAppRecord<CbData, CbProjection, SyncableAppRecordMetadata>;
export type DbCbData = { recordId: string } & CbData;
export type DbCbProjection = { recordId: string } & CbProjection;
export type CbAppEnv = CollectionAppEnvironment<CbData, CbProjection>;
