import { createSyncableRecordMetadata } from '$lib/app-infrastructure/collection-app/data';
import type { DynamicForm } from '$lib/app/dynamic-form/dynamic-form-types';
import { generateId } from '$lib/engine/crypto/crypto-utils';
import { createDbAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

export type CbState = {
	commandName: string;
	commandStr: string;
	formData: DynamicForm;
};

export type CbRecord = CollectionAppRecord<CbState>;
export type DbCbRecord = DbAppRecord<CbState, SyncableAppRecordMetadata>;
export type CbRepo = AppRecordRepo<CbState, SyncableAppRecordMetadata, CollectionAppError>;

function createCommandBuilderRecord(data: CbState) {
	let genericRecord = createDbAppRecord(data, createSyncableRecordMetadata(generateId()));

	return convertToCommandBuilderRecord(genericRecord);
}

function createDbCommandBuilderRecord(data: CbState) {
	return createDbAppRecord(data, createSyncableRecordMetadata(getDeviceId()));
}

export function convertToCommandBuilderRecord(record: DbCbRecord): CbRecord {
	let ret = {
		...record,
		get key(): string {
			return this.data.commandName;
		},
		set key(value) {
			this.data.commandName = value;
		}
	};

	return ret;
}

export const commandBuilderRecordAdapter: CollectionAppRecordAdapter<
	CbState,
	SyncableAppRecordMetadata
> = {
	constructRecord: function (data: CbState) {
		return createCommandBuilderRecord(data);
	},

	constructDbRecord(data) {
		return createDbCommandBuilderRecord(data);
	},

	fromDb: function (dbRecord: DbCbRecord): CbRecord {
		return convertToCommandBuilderRecord(dbRecord);
	},

	toDb: function (appRecord: CbRecord): DbCbRecord {
		return {
			meta: appRecord.meta,
			data: appRecord.data,
			recordId: appRecord.recordId
		};
	}
};
