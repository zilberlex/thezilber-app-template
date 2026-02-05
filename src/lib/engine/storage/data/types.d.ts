type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

interface AppRecord<T> {
	recordId: string;
	meta: AppRecordMetadata;
	data: T;
	get key(): string;
	set key(value: string);
}

type SyncableData<T> = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
	data: T;
};
