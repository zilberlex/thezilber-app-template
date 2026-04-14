import { generateId } from '$lib/engine/crypto/crypto-utils';
import type { CbData, CbProjection, CbRecord, DbCbRecord } from './command-builder-types';
import type {
	AppRecord,
	CollectionAppDbAdapter,
	DbAppRecord,
	SyncableAppRecordMetadata
} from '$lib/app-infrastructure/collection-app/data/types';
import { createSyncableRecordMetadata } from '$lib/app-infrastructure/collection-app/data';
import { createDbAppRecord } from '$lib/engine/storage/data/data';

class CommandBuilderDbAdapter implements CollectionAppDbAdapter<CbData, CbProjection> {
	constructRecord(data: CbData, newItemKey?: string) {
		if (newItemKey) {
			data.commandName = newItemKey;
		}
		let genericRecord = createDbAppRecord(data, createSyncableRecordMetadata(generateId()));

		return this.#convertToCommandBuilderRecord(genericRecord);
	}

	projectionFromData(data: CbData): CbProjection {
		return {
			commandName: data.commandName,
			displayName: data.commandName
		};
	}

	toDbObject(
		record: AppRecord<CbData, CbProjection, SyncableAppRecordMetadata>
	): DbAppRecord<CbData, CbProjection, SyncableAppRecordMetadata> {
		return {
			recordId: record.recordId,
			data: record.data,
			projection: record.projection,
			meta: record.meta,
			keys: { slug: record.slug }
		};
	}

	fromDbObject(
		dbRecord: DbAppRecord<CbData, CbProjection, SyncableAppRecordMetadata>
	): AppRecord<CbData, CbProjection, SyncableAppRecordMetadata> {
		return this.#convertToCommandBuilderRecord(dbRecord);
	}

	#convertToCommandBuilderRecord(record: Omit<DbCbRecord, 'projection'>): CbRecord {
		let _data = record.data;
		let ret = {
			recordId: record.recordId,
			meta: record.meta,
			slug: record.keys.slug,
			data: record.data,
			projection: this.projectionFromData(_data)
		};

		return ret;
	}

	refreshProjection(record: AppRecord<CbData, CbProjection, SyncableAppRecordMetadata>) {
		record.projection = this.projectionFromData(record.data);

		return record;
	}
}

export const cbDbAdapter = new CommandBuilderDbAdapter();
