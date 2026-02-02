import type { DynamicForm } from '$lib/app/dynamic-form/dynamic-form-types';
import { createDbAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

type CommandBuilderState = {
	commandStr: string;
	formData: DynamicForm;
};

type PermanentCommandBuilderState = CommandBuilderState & {
	commandName: string;
};

export type CommandBuilderRecord = AppRecord<PermanentCommandBuilderState>;

export type CommandBuilderDbRecord = DbAppRecord<PermanentCommandBuilderState>;

function createCommandBuilderRecord(data: PermanentCommandBuilderState) {
	let genericRecord = createDbAppRecord(getDeviceId(), data);

	return convertToCommandBuilderRecord(genericRecord);
}

function createDbCommandBuilderRecord(data: PermanentCommandBuilderState) {
	return createDbAppRecord(getDeviceId(), data);
}

export function convertToCommandBuilderRecord(
	record: CommandBuilderDbRecord
): CommandBuilderRecord {
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

export const commandBuilderRecordAdapter: AppRecordAdapter<PermanentCommandBuilderState> = {
	constructRecord: function (data: PermanentCommandBuilderState) {
		return createCommandBuilderRecord(data);
	},

	constructDbRecord(data) {
		return createDbCommandBuilderRecord(data);
	},

	fromDb: function (dbRecord: CommandBuilderDbRecord): CommandBuilderRecord {
		return convertToCommandBuilderRecord(dbRecord);
	},

	toDb: function (appRecord: CommandBuilderRecord): CommandBuilderDbRecord {
		return {
			meta: appRecord.meta,
			data: appRecord.data,
			recordId: appRecord.recordId
		};
	}
};
