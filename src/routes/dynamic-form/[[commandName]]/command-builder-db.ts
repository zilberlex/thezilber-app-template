import Dexie, { type EntityTable } from 'dexie';
const commandBuilderDb = new Dexie('CommandBuilderDb') as Dexie & {
	commands: EntityTable<CommandBuilderData, 'id'>;
};

commandBuilderDb.version(1).stores({
	commands: 'id, data.commandName, modifiedAt'
});

export async function saveCommandDb(command: CommandBuilderData) {
	try {
		await commandBuilderDb.commands.add(command);
	} catch (error) {
		console.error('saveCommand failed.', error);
	}
}

export async function updateCommandDb(command: CommandBuilderData) {
	try {
		await commandBuilderDb.commands.put(command);
	} catch (error) {
		console.error('saveCommand failed.', error);
	}
}
