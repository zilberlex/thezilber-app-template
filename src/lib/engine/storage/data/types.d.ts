type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

type SyncableData<T> = {
	id: string;
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;

	data: T;
};
