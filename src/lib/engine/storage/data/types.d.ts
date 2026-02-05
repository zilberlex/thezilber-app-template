type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

interface AppRecord<TData, TMeta> {
	recordId: string;
	meta: TMeta;
	data: TData;
	get key(): string;
	set key(value: string);
}

interface DbAppRecord<TData, TMeta> {
	recordId: string;
	meta: TMeta;
	data: TData;
}

type SyncableData<T> = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
	data: T;
};
