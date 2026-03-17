import { generateId } from '$lib/engine/crypto/crypto-utils';
import type { DbAppRecord } from './types';

export function timestamp(): number {
	return Date.now();
}

export function createDbAppRecord<TData, TMeta>(
	data: TData,
	meta: TMeta
): DbAppRecord<TData, TMeta> {
	return {
		recordId: generateId(),
		meta,
		data
	};
}
