export async function sleep(msec: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(resolve, msec));
}

export function weak<T extends object>(obj: T | undefined): WeakRef<T> | undefined {
	return obj ? new WeakRef(obj) : undefined;
}
