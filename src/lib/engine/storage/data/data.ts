import { generateId } from '$lib/engine/crypto/crypto-utils';

export function createSyncableData<T>(deviceId: string, data: T): SyncableData<T> {
	return {
		vc: { [deviceId]: 0 },
		modifiedAt: timestamp(),
		modifiedBy: deviceId,
		isDeleted: false,
		data
	};
}

export function updateSyncableData<T>(deviceId: string, syncableData: SyncableData<T>, data: T) {
	syncableData.data = data;
	stampSyncableData(deviceId, syncableData);
}

export function stampSyncableData(deviceId: string, permasState: SyncableData<unknown>) {
	permasState.modifiedAt = timestamp();
	permasState.modifiedBy = deviceId;
	stampeVectorClock(deviceId, permasState.vc);
}

export function timestamp(): number {
	return Date.now();
}

export function createDbAppRecord<T>(deviceId: string, data: T): DbAppRecord<T> {
	return {
		recordId: generateId(),
		meta: createAppRecordMetadata(deviceId),
		data
	};
}

export function stampAppRecord(deviceId: string, meta: AppRecordMetadata) {
	meta.modifiedAt = timestamp();
	meta.modifiedBy = deviceId;
	stampeVectorClock(deviceId, meta.vc);
}

export function createAppRecordMetadata(deviceId: string): AppRecordMetadata {
	return {
		vc: { [deviceId]: 0 },
		modifiedAt: timestamp(),
		modifiedBy: deviceId,
		isDeleted: false
	};
}

function stampeVectorClock(deviceId: string, vc: VectorClock) {
	let deviceVcVal = vc[deviceId] ?? 0;
	vc[deviceId] = ++deviceVcVal;
}
