import { browser } from '$app/environment';
import { deepAssign } from '$lib/app-infrastructure/async-state.svelte';
import { stampAppRecord } from '$lib/engine/storage/data/data';
import { getDeviceId } from '$lib/engine/storage/local/client-info-repository';

export type SmartStoreOptions<T> = {
	loadNotFoundBehavior: { action: 'error' } | { action: 'create-new'; createObj: () => T };
};

const defaultOptions: SmartStoreOptions<any> = {
	loadNotFoundBehavior: { action: 'error' }
};

export class SmartStore<T> {
	#context: CollectionAppContext;
	#record: AppRecord<T>;
	#dataState: AppDataState;
	#recordManager: AppRecordAdapter<T>;
	#options: SmartStoreOptions<T>;
	#repository: AppRecordRepo<T>;

	get data() {
		return this.#record.data;
	}

	get dataState() {
		return this.#dataState;
	}

	constructor(
		context: CollectionAppContext,
		placeHolderValue: T,
		repository: AppRecordRepo<T>,
		recordManager: AppRecordAdapter<T>,
		options?: SmartStoreOptions<T>
	) {
		this.#context = context;
		this.#options = options ?? defaultOptions;
		this.#recordManager = recordManager;

		this.#record = $state(this.#recordManager.constructRecord(placeHolderValue));
		this.#dataState = $state('loading');
		this.#repository = repository;

		if (browser) {
			this.reload(context, placeHolderValue, options);
		}
	}

	async save() {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record) as AppRecord<T>;

		this.#dataState = 'saving';
		let p = this.#repository.update(this.#context, saveData);

		p.then(() => (this.#dataState = 'ready'));

		this.#handleErrorOnOperation(p, 'save');

		return p;
	}

	async saveAs(context: CollectionAppContext) {
		stampAppRecord(getDeviceId(), this.#record.meta);
		let saveData = $state.snapshot(this.#record.data) as T;

		this.#dataState = 'saving';
		let p = this.#repository.create(context, saveData);

		p.then(() => (this.#dataState = 'ready'));

		this.#handleErrorOnOperation(p, 'saveAs');

		return p;
	}

	async delete(context: CollectionAppContext) {
		this.#repository.delete(context, this.#record);
	}

	async reload(
		context: CollectionAppContext,
		placeHolderValue?: T,
		options?: SmartStoreOptions<T>
	) {
		this.#dataState = 'loading';

		if (placeHolderValue) {
			this.#record = this.#recordManager.constructRecord(placeHolderValue);
		}

		let recordPromise = this.#repository.load(context);

		recordPromise.then((r) => {
			if (r) {
				// todo Az refactor not code dup
				deepAssign(this.#record, this.#recordManager.fromDb(r));
				this.#dataState = 'ready';
			} else {
				const notFoundBehvior = this.#options.loadNotFoundBehavior;
				if (notFoundBehvior.action === 'create-new') {
					deepAssign(
						this.#record,
						this.#recordManager.constructRecord(notFoundBehvior.createObj())
					);
					this.#dataState = 'ready';
				} else {
					this.#dataState = 'error';
				}
			}
		});
	}

	#handleErrorOnOperation(promise: Promise<any>, strContext: string) {
		promise.catch((e: any) => {
			if (e instanceof Error) {
				console.log(`Error on [${strContext}]`, e);
			} else {
				console.log(`Error on [${strContext}]`);
			}
			this.#dataState = 'error';
		});
	}
}
