type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

type SyncableData<T> = {
	id: string; // item UUID
	data: T;
	vc: VectorClock;

	updatedAt: number;
	updatedBy: string;

	deleted?: boolean;
};
