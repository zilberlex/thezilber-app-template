import { generateId } from '$lib/engine/crypto/crypto-utils';
import Dexie, { type EntityTable } from 'dexie';

type PermanentCommandBuilderStateDb = PermanentCommandBuilderState & {
	commandNameKey: string; // normalized lookup key
};

type CommandBuilderDataDb = AppRecord<PermanentCommandBuilderStateDb>;

// command-builder-db.ts
const commandBuilderDb = new Dexie('CommandBuilderDb') as Dexie & {
	commands: EntityTable<CommandBuilderDataDb, 'id'>;
};

commandBuilderDb.version(2).stores({
	commands: 'id, &data.commandNameKey, meta.modifiedAt'
});

function informativeStructuredClone<T>(item: T): T {
	try {
		return structuredClone(item);
	} catch (e: any) {
		const info = findCloneFailurePath(item) ?? 'Could not locate failing field';
		throw new Error(`structuredClone failed. ${info}. original error: ${e?.message ?? e}`);
	}
}

export async function saveCommandDb(command: CommandBuilderRecord) {
	try {
		let dbCommand = toDbCommand(command);
		dbCommand.id = generateId();

		console.log('[NEW] saveCommandDb', command);

		let cloned = informativeStructuredClone(dbCommand);

		await commandBuilderDb.commands.add(cloned);

		return toPublicCommand(dbCommand);
	} catch (error) {
		console.error('saveCommand failed.', error);
		throw error;
	}
}

export async function updateCommandDb(command: CommandBuilderRecord) {
	try {
		let dbCommand = toDbCommand(command);
		await commandBuilderDb.commands.put(dbCommand);
	} catch (error) {
		console.error('updateCommand failed.', error);
	}
}

export async function loadCommandByName(commandName: string) {
	try {
		let commandNameKey = normalizeStringKey(commandName);
		const dbCommand = await commandBuilderDb.commands
			.where('data.commandNameKey')
			.equals(commandNameKey)
			.first();

		return dbCommand ? toPublicCommand(dbCommand) : undefined;
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

// TODO AZ use standard methods
function normalizeStringKey(commandName: string): any {
	return commandName.toLowerCase();
}

function toDbCommand(command: CommandBuilderRecord): CommandBuilderDataDb {
	// don’t mutate input (avoids annoying UI bugs)
	return {
		...command,
		data: {
			...command.data,
			commandNameKey: normalizeStringKey(command.data.commandName)
		}
	};
}

function toPublicCommand(dbCommand: CommandBuilderDataDb): CommandBuilderRecord {
	// strip internal field so it can’t leak into UI types
	// (runtime remove; TS remove happens via return type)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { commandNameKey, ...rest } = dbCommand.data;
	return { ...dbCommand, data: rest };
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
