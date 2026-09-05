import type { Plugin } from 'vite';

interface ScssModule {
	/** Project-root-relative path to the scss module, no extension. e.g. 'src/lib/ui/style/utility/utility' */
	path: string;
	/** Namespace for this module. '*' merges into global scope. Default: '*' */
	namespace?: string;
}

interface ScssGlobalsOptions {
	/** Modules to inject, in order. String shorthand = { path, namespace: '*' } */
	modules: (string | ScssModule)[];
	/** Files whose normalized path matches any of these patterns are skipped. */
	exclude?: (string | RegExp)[];
}

export function scssGlobals({ modules, exclude = [] }: ScssGlobalsOptions): Plugin {
	const normalizedModules = modules.map((m) =>
		typeof m === 'string' ? { path: m, namespace: '*' } : { namespace: '*', ...m }
	);

	const injection = normalizedModules.map(({ path, namespace }) => `@use '${path}' as ${namespace};`).join('') + '\n';

	const isExcluded = (path: string) => exclude.some((p) => (typeof p === 'string' ? path.includes(p) : p.test(path)));

	return {
		name: 'scss-globals',
		config() {
			return {
				css: {
					preprocessorOptions: {
						scss: {
							loadPaths: [process.cwd()],
							additionalData(source: string, filename: string) {
								const normalized = filename.replace(/\\/g, '/');
								if (isExcluded(normalized)) return source;
								return injection + source;
							}
						}
					}
				}
			};
		}
	};
}
