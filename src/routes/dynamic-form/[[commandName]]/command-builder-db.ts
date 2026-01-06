import { generateId } from '$lib/engine/crypto/crypto-utils';
import Dexie, { type EntityTable } from 'dexie';

type PermanentCommandBuilderStateDb = PermanentCommandBuilderState & {
	commandNameKey: string; // normalized lookup key
};

type CommandBuilderDataDb = SyncableData<PermanentCommandBuilderStateDb>;

// command-builder-db.ts
const commandBuilderDb = new Dexie('CommandBuilderDb') as Dexie & {
	commands: EntityTable<CommandBuilderDataDb, 'id'>;
};

commandBuilderDb.version(1).stores({
	commands: 'id, &data.commandNameKey, modifiedAt'
});

export async function saveCommandDb(command: CommandBuilderData) {
	try {
		let dbCommand = toDbCommand(command);
		dbCommand.id = generateId();

		await commandBuilderDb.commands.add(dbCommand);
	} catch (error) {
		console.error('saveCommand failed.', error);
	}
}

export async function updateCommandDb(command: CommandBuilderData) {
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

function toDbCommand(command: CommandBuilderData): CommandBuilderDataDb {
	// don’t mutate input (avoids annoying UI bugs)
	return {
		...command,
		data: {
			...command.data,
			commandNameKey: normalizeStringKey(command.data.commandName)
		}
	};
}

function toPublicCommand(dbCommand: CommandBuilderDataDb): CommandBuilderData {
	// strip internal field so it can’t leak into UI types
	// (runtime remove; TS remove happens via return type)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { commandNameKey, ...rest } = dbCommand.data;
	return { ...dbCommand, data: rest };
}
