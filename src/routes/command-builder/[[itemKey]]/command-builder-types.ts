import { createSyncableRecordMetadata } from '$lib/app-infrastructure/collection-app/data';
import type { CollectionAppRecord } from '$lib/app-infrastructure/collection-app/types';
import type { DynamicForm } from '$lib/app/dynamic-form/dynamic-form-types';
import { generateId } from '$lib/engine/crypto/crypto-utils';
import { createDbAppRecord } from '$lib/engine/storage/data/data';
import type {
	DataProjection,
	DbAppRecord,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

export type CbData = {
	commandName: string;
	commandStr: string;
	formData: DynamicForm;
};
export type CbProjection = {
	commandName: string;
} & DataProjection;

export type CbRecord = CollectionAppRecord<CbData, CbProjection>;

export type DbCbRecord = DbAppRecord<CbData, CbProjection, SyncableAppRecordMetadata>;
export type DbCbData = { recordId: string } & CbData;
export type DbCbProjection = { recordId: string } & CbProjection;
