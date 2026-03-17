import { generateId } from '$lib/engine/crypto/crypto-utils';
import { timestamp } from '$lib/engine/storage/data/data';
import type { SyncableAppRecordMetadata, VectorClock } from '$lib/engine/storage/data/types';

export function stampAppRecord(deviceId: string, meta: SyncableAppRecordMetadata) {
	meta.modifiedAt = timestamp();
	meta.modifiedBy = deviceId;
	stampeVectorClock(deviceId, meta.vc);
}

export function createSyncableRecordMetadata(deviceId: string): SyncableAppRecordMetadata {
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
