import { generateId } from '$lib/engine/crypto/crypto-utils';
import Dexie, { type EntityTable } from 'dexie';
import type { DbCbRecord } from './command-builder-types';

const commandBuilderDb = new Dexie('CommandBuilderDb') as Dexie & {
	commands: EntityTable<DbCbRecord, 'recordId'>;
};

commandBuilderDb.version(2).stores({
	commands: 'recordId, &data.commandName, meta.modifiedAt'
});

function informativeStructuredClone<T>(item: T): T {
	try {
		return structuredClone(item);
	} catch (e: any) {
		const info = findCloneFailurePath(item) ?? 'Could not locate failing field';
		throw new Error(`structuredClone failed. ${info}. original error: ${e?.message ?? e}`);
	}
}

export async function saveCommandDb(command: DbCbRecord) {
	try {
		command.recordId = generateId();

		console.log('[NEW] saveCommandDb', command);

		let cloned = informativeStructuredClone(command);

		await commandBuilderDb.commands.add(cloned);

		return command;
	} catch (error) {
		console.error('saveCommand failed.', error);
		throw error;
	}
}

export async function updateCommandDb(dbCommand: DbCbRecord) {
	try {
		await commandBuilderDb.commands.put(dbCommand);
	} catch (error) {
		console.error('updateCommand failed.', error);
	}
}

export async function deleteCommandById(redordId: string) {
	await commandBuilderDb.commands.delete(redordId);
}

export async function loadCommandByName(commandName: string) {
	try {
		const dbCommand = await commandBuilderDb.commands
			.where('data.commandName')
			.equals(commandName)
			.first();

		return dbCommand ? dbCommand : undefined;
	} catch (error) {
		console.error(
			'loadCommandByName failed. commandName requested',
			commandName,
			'. error:',
			error
		);
		return undefined;
	}
}

function findCloneFailurePath(
	value: any,
	path = 'root',
	seen = new WeakSet<object>()
): string | null {
	if (value === null || typeof value !== 'object') return null;

	if (seen.has(value)) return `Circular reference at ${path}`;
	seen.add(value);

	for (const key of Reflect.ownKeys(value)) {
		const desc = Object.getOwnPropertyDescriptor(value, key);
		if (!desc) continue;

		if (typeof desc.get === 'function' || typeof desc.set === 'function') {
			return `Accessor property at ${path}.${String(key)}`;
		}

		const child = (value as any)[key];

		if (typeof child === 'function') {
			return `Function at ${path}.${String(key)}`;
		}

		if (child && typeof child === 'object') {
			try {
				structuredClone(child);
			} catch (e: any) {
				// IMPORTANT: keep digging to find the real leaf
				const deeper = findCloneFailurePath(child, `${path}.${String(key)}`, seen);
				if (deeper) return deeper;

				const ctor = child?.constructor?.name ?? 'unknown';
				return `Unclonable object at ${path}.${String(key)} (ctor=${ctor}): ${e?.message ?? e}`;
			}
		}

		const deeper = findCloneFailurePath(child, `${path}.${String(key)}`, seen);
		if (deeper) return deeper;
	}

	return null;
}
