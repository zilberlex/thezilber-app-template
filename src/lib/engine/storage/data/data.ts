export function createSyncableData<T>(deviceId: string, data: T): SyncableData<T> {
	return {
		id: crypto.randomUUID(),
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

function stampeVectorClock(deviceId: string, vc: VectorClock) {
	let deviceVcVal = vc[deviceId] ?? 0;
	vc[deviceId] = ++deviceVcVal;
}
