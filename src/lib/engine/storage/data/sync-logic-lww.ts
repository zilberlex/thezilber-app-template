export function syncData<T>(localData: SyncableData<T>, incomingData: SyncableData<T>) {
	return returnSyncedDataLww(localData, incomingData);
}

function returnSyncedDataLww<T>(
	localData: SyncableData<T>,
	incomingData: SyncableData<T>
): SyncableData<T> {
	if (localData.id !== incomingData.id)
		throw new Error(
			`Expected Data To have the same id localData: ${localData.id}, incomingData: ${incomingData.id}`
		);

	const vc1 = localData.vc;
	const vc2 = incomingData.vc;

	const vcComparisonResult = compareVcs(vc1, vc2);

	let ret = localData;
	if (vcComparisonResult === 'incoming-dominates') ret = incomingData;

	ret = resolveConcurrentConflictLww(localData, incomingData);
	ret.vc = mergeClocksAfterDataSync(localData.vc, incomingData.vc);

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
	dataLocal: SyncableData<T>,
	dataIncoming: SyncableData<T>
) {
	let newest = dataLocal.updatedAt > dataIncoming.updatedAt ? dataLocal : dataIncoming;
	let ret = newest;

	return ret;
}
