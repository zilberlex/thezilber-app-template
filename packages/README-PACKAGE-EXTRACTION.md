# Extracting a package

## Basic Flow

1. Move package to root/packages (Webstorm)

2. Update imports to "@package-name"

- regex for general package:
  ['"].*packages/[package-name]/src(?!.*svelte)['"]
  - replace:
    '@svelte-ascend/[package-name]'
- regex for svelte package:
  ['"].\*packages/[package-name]/src/svelte['"]
  - '@svelte-ascend/[package-name]/svelte'

3. add package.json
4. make sure internal package imports are relational.
5. from svelte-ascend root:

- pnpm install
- pnpm --filter @svelte-ascend/[package-name] package

6. wire app package.json:

```json
"dependencies": {
"@svelte-ascend/core": "link:../svelte-ascend/packages/core",
"@svelte-ascend/interactions": "link:../svelte-ascend/packages/interactions"
}
```

7. in app:

- pnpm install
- readlink -f node_modules/@svelte-ascend/[package-name]
- pnpm build

## General Checklist:

- internal self-imports → relative imports
- imports from core → @svelte-ascend/core
- imports from another extracted package → @svelte-ascend/[package-name]
- public index.ts contains intentional API only
- Svelte-only API separated into /svelte when appropriate
- no references to old $lib/packages/... paths
- no references to old repository paths
- workspace:\* dependencies accurately declared
- svelte-package succeeds
- external app link resolves to new repo
- pnpm check succeeds in main app
- pnpm build succeeds in main app
- old source removed only after all of the above

## Example Package JSON of new Package

make sure to add internal dependencies

### package.json PURE TS

```json
{
	"name": "@svelte-ascend/interactions",
	"version": "0.1.0-alpha.0",
	"private": true,
	"type": "module",
	"files": ["dist"],
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		}
	},
	"scripts": {
		"clean": "rm -rf dist",
		"package": "pnpm clean && svelte-package",
		"package:watch": "svelte-package --watch"
	},
	"dependencies": {
		"@svelte-ascend/core": "workspace:*"
	},
	"devDependencies": {
		"@sveltejs/package": "^2.5.8",
		"svelte": "^5.56.1",
		"typescript": "^6.0.3"
	},
	"publishConfig": {
		"access": "public"
	}
}
```

### package.json MIXED SVELTE package (and pure ts)

```json

package.json:
"
{
	"name": "@svelte-ascend/core",
	"version": "0.1.0-alpha.0",
	"private": true,
	"type": "module",
	"files": [
		"dist"
	],
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		},
		"./svelte": {
			"types": "./dist/svelte/index.d.ts",
			"svelte": "./dist/svelte/index.js",
			"default": "./dist/svelte/index.js"
		}
	},
	"scripts": {
		"clean": "rm -rf dist",
		"package": "pnpm clean && svelte-package",
		"package:watch": "svelte-package --watch"
	},
	"peerDependencies": {
		"svelte": "^5.0.0"
	},
	"peerDependenciesMeta": {
		"svelte": {
			"optional": true
		}
	},
	"devDependencies": {
		"@sveltejs/package": "^2.0.0",
		"svelte": "^5.0.0",
		"typescript": "^5.9.0"
	},
	"publishConfig": {
		"access": "public"
	}
}
"
```

### PACKAGE JSON PURE SVELTE

```json
{
	"name": "@svelte-ascend/hotkeys",
	"version": "0.1.0-alpha.0",
	"private": true,
	"type": "module",
	"files": ["dist"],
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		},
		"./svelte": {
			"types": "./dist/svelte/index.d.ts",
			"svelte": "./dist/svelte/index.js",
			"default": "./dist/svelte/index.js"
		}
	},
	"scripts": {
		"clean": "rm -rf dist",
		"package": "pnpm clean && svelte-package",
		"package:watch": "svelte-package --watch"
	},
	"dependencies": {
		"@svelte-ascend/core": "workspace:*"
	},
	"peerDependencies": {
		"svelte": "^5.0.0"
	},
	"peerDependenciesMeta": {
		"svelte": {
			"optional": true
		}
	},
	"devDependencies": {
		"@sveltejs/package": "^2.5.8",
		"svelte": "^5.56.1",
		"typescript": "^6.0.3"
	},
	"publishConfig": {
		"access": "public"
	}
}
```
