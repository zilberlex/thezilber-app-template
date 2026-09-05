// Made by ChatGPT

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type ValueKind = 'primitive' | 'array' | 'map' | 'set' | 'object' | 'date' | 'unknown';

type StateSetter<T> = (value: T) => void;

type CopyTarget<T> = T extends Primitive ? StateSetter<T> : T | StateSetter<T>;

export type CopyTargets<TSource extends object> = {
	[K in keyof TSource]?: CopyTarget<TSource[K]>;
};

type CopyStateOptions = {
	warn?: boolean;
};

type PatchWarning = {
	path: string;
	message: string;
	targetType: string;
	sourceType: string;
	hint?: string;
};

type PatchContext = {
	target: any;
	source: any;
	path: string;
	warnings: PatchWarning[];
};

export function copyState<TSource extends object>(
	source: TSource | undefined,
	targets: CopyTargets<TSource>,
	options: CopyStateOptions = { warn: true }
): boolean {
	if (!source) {
		return false;
	}

	const warnings: PatchWarning[] = [];

	copyFields(source, targets, warnings);

	if (options.warn !== false && warnings.length > 0) {
		console.warn(formatPatchWarnings(warnings));
	}

	return true;
}

function copyFields<TSource extends object>(source: TSource, targets: CopyTargets<TSource>, warnings: PatchWarning[]) {
	for (const key of Reflect.ownKeys(source) as Array<keyof TSource>) {
		const sourceValue = source[key];
		const sourceKind = getKind(sourceValue);
		const target = targets[key];
		const fieldPath = `$.${String(key)}`;

		if (target === undefined) {
			warnings.push({
				path: fieldPath,
				message: 'Field exists on source but not target; skipping source field',
				targetType: 'missing',
				sourceType: sourceKind
			});

			continue;
		}

		if (typeof target === 'function') {
			target(sourceValue);
			continue;
		}

		if (sourceKind === 'primitive') {
			warnings.push({
				path: fieldPath,
				message: 'Primitive value requires a setter target; skipping source field',
				targetType: getKind(target),
				sourceType: sourceKind,
				hint: `Try: ${getPrimitiveSetterHint(fieldPath)}`
			});

			continue;
		}

		patchValue({
			target,
			source: sourceValue,
			path: fieldPath,
			warnings
		});
	}

	for (const key of Reflect.ownKeys(targets) as Array<keyof TSource>) {
		if (!Reflect.has(source, key)) {
			const target = targets[key];

			warnings.push({
				path: `$.${String(key)}`,
				message: 'Field exists on target but not source; leaving target unchanged',
				targetType: typeof target === 'function' ? 'setter' : getKind(target),
				sourceType: 'missing'
			});
		}
	}
}

function patchValue(ctx: PatchContext): any {
	const { target, source, path, warnings } = ctx;

	const sourceKind = getKind(source);
	const targetKind = getKind(target);

	if (sourceKind !== targetKind) {
		warnings.push({
			path,
			message: 'Type mismatch; replacing target value is not possible for non-setter target',
			targetType: targetKind,
			sourceType: sourceKind
		});

		return target;
	}

	switch (sourceKind) {
		case 'primitive':
			warnings.push({
				path,
				message: 'Primitive value requires a setter target; skipping source field',
				targetType: targetKind,
				sourceType: sourceKind,
				hint: `Try: ${getPrimitiveSetterHint(path)}`
			});

			return target;

		case 'array':
			return patchArray(target, source);

		case 'map':
			return patchMap(target, source);

		case 'set':
			return patchSet(target, source);

		case 'date':
			warnings.push({
				path,
				message: 'Date field requires a setter target; skipping source field',
				targetType: targetKind,
				sourceType: sourceKind,
				hint: `Try: ${getPrimitiveSetterHint(path)}`
			});

			return target;

		case 'object':
			return patchObject(target, source, path, warnings);

		default:
			warnings.push({
				path,
				message: 'Unsupported value type; skipping source field',
				targetType: targetKind,
				sourceType: sourceKind
			});

			return target;
	}
}

function patchArray(target: any[], source: any[]) {
	target.length = 0;
	target.push(...source);

	return target;
}

function patchMap(target: Map<any, any>, source: Map<any, any>) {
	target.clear();

	for (const [key, value] of source) {
		target.set(key, value);
	}

	return target;
}

function patchSet(target: Set<any>, source: Set<any>) {
	target.clear();

	for (const value of source) {
		target.add(value);
	}

	return target;
}

function patchObject(
	target: Record<PropertyKey, any>,
	source: Record<PropertyKey, any>,
	path: string,
	warnings: PatchWarning[]
) {
	for (const key of Reflect.ownKeys(target)) {
		if (!Reflect.has(source, key)) {
			warnings.push({
				path: `${path}.${String(key)}`,
				message: 'Field exists on target but not source; leaving target field unchanged',
				targetType: getKind(target[key]),
				sourceType: 'missing'
			});
		}
	}

	for (const key of Reflect.ownKeys(source)) {
		const fieldPath = `${path}.${String(key)}`;

		if (!Reflect.has(target, key)) {
			warnings.push({
				path: fieldPath,
				message: 'Field exists on source but not target; skipping source field',
				targetType: 'missing',
				sourceType: getKind(source[key])
			});

			continue;
		}

		const sourceValue = source[key];
		const targetValue = target[key];

		if (typeof targetValue === 'function') {
			targetValue(sourceValue);
			continue;
		}

		if (getKind(sourceValue) === 'primitive') {
			warnings.push({
				path: fieldPath,
				message: 'Primitive nested field requires a setter target; skipping source field',
				targetType: getKind(targetValue),
				sourceType: getKind(sourceValue),
				hint: `Try: ${getPrimitiveSetterHint(fieldPath)}`
			});

			continue;
		}

		patchValue({
			target: targetValue,
			source: sourceValue,
			path: fieldPath,
			warnings
		});
	}

	return target;
}

function formatPatchWarnings(warnings: PatchWarning[]) {
	const lines = warnings.map((warning) => {
		const warningLines = [
			`[${formatWarningPath(warning.path)}]`,
			`  ${warning.message}`,
			`  target: ${warning.targetType}`,
			`  source: ${warning.sourceType}`
		];

		if (warning.hint) {
			warningLines.push(`  ${warning.hint}`);
		}

		return warningLines.join('\n');
	});

	return ['State copy warnings:', ...lines].join('\n');
}

function formatWarningPath(path: string) {
	if (path.startsWith('$.')) {
		return path.slice(2);
	}

	if (path === '$') {
		return 'state';
	}

	return path;
}

function getFieldNameFromPath(path: string) {
	const formattedPath = formatWarningPath(path);
	const parts = formattedPath.split('.');

	return parts.at(-1) ?? formattedPath;
}

function getPrimitiveSetterHint(path: string) {
	const fieldName = getFieldNameFromPath(path);

	return `${fieldName}: (val) => ${fieldName} = val`;
}

function getKind(value: any): ValueKind {
	if (value === null || typeof value !== 'object') {
		return 'primitive';
	}

	if (value instanceof Date) {
		return 'date';
	}

	if (Array.isArray(value)) {
		return 'array';
	}

	if (isMapLike(value)) {
		return 'map';
	}

	if (isSetLike(value)) {
		return 'set';
	}

	if (isObjectLike(value)) {
		return 'object';
	}

	return 'unknown';
}

function isMapLike(value: any): value is Map<any, any> {
	return (
		value !== null &&
		typeof value === 'object' &&
		typeof value.clear === 'function' &&
		typeof value.set === 'function' &&
		typeof value.entries === 'function'
	);
}

function isSetLike(value: any): value is Set<any> {
	return (
		value !== null &&
		typeof value === 'object' &&
		typeof value.clear === 'function' &&
		typeof value.add === 'function' &&
		typeof value.values === 'function'
	);
}

function isObjectLike(value: any) {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	if (value instanceof Date) return false;
	if (Array.isArray(value)) return false;
	if (isMapLike(value)) return false;
	if (isSetLike(value)) return false;

	return true;
}
