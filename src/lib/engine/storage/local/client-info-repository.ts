import { loadState, saveState } from './local-storage-repository';

const DeviceIdStorageKey = 'DeviceId';

export function getDeviceId() {
	let deviceId = loadState(DeviceIdStorageKey);

	if (!deviceId) {
		saveState(DeviceIdStorageKey, crypto.randomUUID());
		deviceId = loadState(DeviceIdStorageKey);
		if (!deviceId) throw Error('Failure to Initialize DeviceId');
	}

	return deviceId;
}
