type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

type SyncableData<T> = {
	id: string;
	vc: VectorClock;

	updatedAt: number;
	updatedBy: string;
	deleted?: boolean;

	data: T;
};
