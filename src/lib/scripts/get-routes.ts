export function getRoutes() {
    const modules = import.meta.glob('/src/routes/**/+page.svelte');
    const ret = [];

    for (const path in modules) {
        const route = path.replace('/src/routes', '')
                          .replace('/+page.svelte', '')
                          .replace(/\[([^\]]+)\]/g, ':$1')
			              || '/';

        // const parts = route?;
        ret.push(route);
    }

    return ret;
}