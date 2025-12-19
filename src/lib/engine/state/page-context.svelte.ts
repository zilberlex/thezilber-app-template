export type PageContext = {
	title: string;
};

export const pageContext: PageContext = $state({
	title: ''
});
