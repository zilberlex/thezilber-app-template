export function syncData<T>(
	localData: AppRecord<T, SyncableAppRecordMetadata>,
	incomingData: AppRecord<T, SyncableAppRecordMetadata>
) {
	return returnSyncedDataLww(localData, incomingData);
}

function returnSyncedDataLww<T>(
	localRecord: AppRecord<T, SyncableAppRecordMetadata>,
	incomingRecord: AppRecord<T, SyncableAppRecordMetadata>
): AppRecord<T, SyncableAppRecordMetadata> {
	if (localRecord.recordId !== incomingRecord.recordId)
		throw new Error(
			`Expected Data To have the same id localData: ${localRecord.recordId}, incomingData: ${incomingRecord.recordId}`
		);

	const vc1 = localRecord.meta.vc;
	const vc2 = incomingRecord.meta.vc;

	const vcComparisonResult = compareVcs(vc1, vc2);

	let ret = localRecord;
	if (vcComparisonResult === 'incoming-dominates') ret = incomingRecord;

	ret = resolveConcurrentConflictLww(localRecord, incomingRecord);
	ret.meta.vc = mergeClocksAfterDataSync(localRecord.meta.vc, incomingRecord.meta.vc);

	return ret;
}

function compareVcs(
	vcBase: VectorClock,
	vcIncoming: VectorClock
): 'equal-clocks' | 'concurrent-edits' | 'base-dominates' | 'incoming-dominates' {
	const devices = new Set([...Object.keys(vcBase), ...Object.keys(vcIncoming)]);

	let vcBaseLessSomewhere = false;
	let vcIncomingLessSomewhere = false;

	devices.forEach((k) => {
		const clockBase = vcBase[k] ?? 0;
		const clockIncoming = vcIncoming[k] ?? 0;

		vcBaseLessSomewhere ||= clockBase < clockIncoming;
		vcIncomingLessSomewhere ||= clockIncoming < clockBase;
	});

	if (vcBaseLessSomewhere && vcIncomingLessSomewhere) return 'concurrent-edits';
	if (!vcBaseLessSomewhere && vcIncomingLessSomewhere) return 'base-dominates';
	if (vcBaseLessSomewhere && !vcIncomingLessSomewhere) return 'incoming-dominates';

	return 'equal-clocks';
}

function mergeClocksAfterDataSync(vc1: VectorClock, vc2: VectorClock): VectorClock {
	let devices = new Set([...Object.keys(vc1), ...Object.keys(vc2)]);

	let finalVc: VectorClock = {};
	devices.forEach((device) => (finalVc[device] = Math.max(vc1[device] ?? 0, vc2[device] ?? 0)));

	return finalVc;
}

function resolveConcurrentConflictLww<T>(
	localRecord: AppRecord<T, SyncableAppRecordMetadata>,
	incomindRecord: AppRecord<T, SyncableAppRecordMetadata>
) {
	let newest =
		localRecord.meta.modifiedAt > incomindRecord.meta.modifiedAt ? localRecord : incomindRecord;
	let ret = newest;

	return ret;
}
