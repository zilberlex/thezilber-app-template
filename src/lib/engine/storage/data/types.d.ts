type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

type AppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

type AppRecord<T> = {
	id?: string;
	meta: AppRecordMetadata;
	data: T;
};

type SyncableData<T> = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
	data: T;
};
