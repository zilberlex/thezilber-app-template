import { timestamp } from '$lib/engine/storage/data/data';
import type { SyncableAppRecordMetadata, VectorClock } from '$lib/app-infrastructure/collection-app/data/types';

export function stampAppRecord(deviceId: string, meta: SyncableAppRecordMetadata) {
	meta.modifiedAt = timestamp();
	meta.modifiedBy = deviceId;
	if (!meta.vc) {
		console.warn('VectorClock is not initialized', meta);

		meta.vc = createVc(deviceId);
	}
	stampeVectorClock(deviceId, meta.vc);
}

export function createSyncableRecordMetadata(deviceId: string): SyncableAppRecordMetadata {
	return {
		vc: createVc(deviceId),
		modifiedAt: timestamp(),
		modifiedBy: deviceId,
		isDeleted: false
	};
}

function createVc(deviceId: string) {
	return { [deviceId]: 0 };
}

function stampeVectorClock(deviceId: string, vc: VectorClock) {
	let deviceVcVal = vc[deviceId] ?? 0;
	vc[deviceId] = ++deviceVcVal;
}
