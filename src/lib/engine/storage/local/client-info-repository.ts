import { browser } from '$app/environment';
import { loadLocalStorage, saveLocalStorage } from './local-storage-repository';

const DeviceIdStorageKey = 'DeviceId';

let cachedDeviceId: string | undefined = undefined;
export function getDeviceId() {
	if (!browser) return 'ServerStubDeviceId';
	if (cachedDeviceId) return cachedDeviceId;

	let deviceId = loadLocalStorage(DeviceIdStorageKey);

	if (!deviceId) {
		saveLocalStorage(DeviceIdStorageKey, crypto.randomUUID());
		deviceId = loadLocalStorage(DeviceIdStorageKey);
		if (!deviceId) throw Error('Failure to Initialize DeviceId');
	}

	cachedDeviceId = deviceId;
	return deviceId;
}
