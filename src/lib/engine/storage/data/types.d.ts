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

type DbAllRecordsInfo<TMeta> = Omit<DbAppRecord<any, TMeta>, 'data'>[];

export type SyncableAppRecordMetadata = {
	vc: VectorClock;

	modifiedAt: number;
	modifiedBy: string;
	isDeleted?: boolean;
};
