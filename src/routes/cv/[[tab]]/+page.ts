import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const validTabs = ['about', 'svelte', 'c-sharp'];

export const prerender = true;

export const entries = () => [{}, { tab: 'about' }, { tab: 'svelte' }, { tab: 'c-sharp' }];

export const load: PageLoad = ({ params }) => {
	if (params.tab && !validTabs.includes(params.tab)) error(404);
};
