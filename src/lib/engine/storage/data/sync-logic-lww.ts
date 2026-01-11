// TODO AZ move to work with Record
export function syncData<T>(localData: AppRecord<T>, incomingData: AppRecord<T>) {
	return returnSyncedDataLww(localData, incomingData);
}

function returnSyncedDataLww<T>(
	localRecord: AppRecord<T>,
	incomingRecord: AppRecord<T>
): AppRecord<T> {
	if (localRecord.id !== incomingRecord.id)
		throw new Error(
			`Expected Data To have the same id localData: ${localRecord.id}, incomingData: ${incomingRecord.id}`
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

function resolveConcurrentConflictLww<T>(localRecord: AppRecord<T>, incomindRecord: AppRecord<T>) {
	let newest =
		localRecord.meta.modifiedAt > incomindRecord.meta.modifiedAt ? localRecord : incomindRecord;
	let ret = newest;

	return ret;
}
