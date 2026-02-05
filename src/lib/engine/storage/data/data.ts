import { stampSyncableData } from '$lib/app-infrastructure/collection-app/data';
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

export function timestamp(): number {
	return Date.now();
}

export function createDbAppRecord<TData, TMeta>(
	data: TData,
	meta: TMeta
): DbAppRecord<TData, TMeta> {
	return {
		recordId: generateId(),
		meta,
		data
	};
}
