import type { Plugin } from 'vite';

export interface ScssModule {
	path: string;
	namespace?: string;
}

export interface ScssGlobalsOptions {
	modules: (string | ScssModule)[];
	exclude?: (string | RegExp)[];
}

export function scssGlobals({ modules, exclude = [] }: ScssGlobalsOptions): Plugin {
	const normalizedModules = modules.map((module) =>
		typeof module === 'string' ? { path: module, namespace: '*' } : { namespace: '*', ...module }
	);

	const injection = normalizedModules.map(({ path, namespace }) => `@use '${path}' as ${namespace};`).join('\n') + '\n';

	const isExcluded = (path: string) =>
		exclude.some((pattern) => (typeof pattern === 'string' ? path.includes(pattern) : pattern.test(path)));

	return {
		name: 'scss-globals',
		config() {
			return {
				css: {
					preprocessorOptions: {
						scss: {
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
