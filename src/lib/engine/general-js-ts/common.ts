export async function sleep(msec: number) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

export function weak(obj: object | undefined) {
	return obj ? new WeakRef(obj) : undefined;
}
