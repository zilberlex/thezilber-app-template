import { generateId } from '$lib/engine/crypto/crypto-utils';
import type { DbAppRecord } from '../../../app-infrastructure/collection-app/data/types';

export function timestamp(): number {
	return Date.now();
}

export function createDbAppRecord<TData, TMeta>(
	data: TData,
	meta: TMeta
): Omit<DbAppRecord<TData, unknown, TMeta>, 'projection'> {
	return {
		keys: { slug: '' },
		recordId: generateId(),
		meta,
		data
	};
}
