// import type { CollectionAppRecordAdapter } from '$lib/app-infrastructure/collection-app/types';
// import type { CbData, DbCbRecord } from './command-builder-types';
//
// function createCommandBuilderRecord(data: CbData) {
// 	let genericRecord = createDbAppRecord(data, createSyncableRecordMetadata(generateId()));
//
// 	return convertToCommandBuilderRecord(genericRecord);
// }
//
// function createDbCommandBuilderRecord(data: CbData) {
// 	return createDbAppRecord(data, createSyncableRecordMetadata(getDeviceId()));
// }
//
// export function convertToCommandBuilderRecord(record: DbCbRecord): CbRecord {
// 	let ret = {
// 		...record,
// 		get key(): string {
// 			return this.data.commandName;
// 		},
// 		set key(value) {
// 			this.data.commandName = value;
// 		}
// 	};
//
// 	return ret;
// }
//
// export const cbRecordAdaper: CollectionAppRecordAdapter<CbData, SyncableAppRecordMetadata> = {
// 	constructRecord: function (data: CbData) {
// 		return createCommandBuilderRecord(data);
// 	},
//
// 	constructDbRecord(data) {
// 		return createDbCommandBuilderRecord(data);
// 	},
//
// 	fromDb: function (dbRecord: DbCbRecord): CbRecord {
// 		return convertToCommandBuilderRecord(dbRecord);
// 	},
//
// 	toDb: function (appRecord: CbRecord): DbCbRecord {
// 		return {
// 			meta: appRecord.meta,
// 			data: appRecord.data,
// 			recordId: appRecord.recordId
// 		};
// 	}
// };
