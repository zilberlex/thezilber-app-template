export type AppModel = {
	title: string;
	command: string;
};

export type LoadResult = {
	initialModel: AppModel;
	modelPromise: Promise<AppModel>;
};
