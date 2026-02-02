type DeviceId = string;
type VectorClock = Record<DeviceId, number>;

type AppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};

interface AppRecord<T> {
	recordId: string;
	meta: AppRecordMetadata;
	data: T;
	get key(): string;
	set key(value: string);
}

interface DbAppRecord<T> {
	recordId: string;
	meta: AppRecordMetadata;
	data: T;
}

type AppRecordAdapter<T> = {
	constructRecord(data: T): AppRecord<T>;
	constructDbRecord(data: T): DbAppRecord<T>;
	fromDb: (dbRecord: DbAppRecord<T>) => AppRecord<T>;
	toDb: (AppRecord: AppRecord<T>) => DbAppRecord<T>;
};

type SyncableData<T> = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
	data: T;
};
