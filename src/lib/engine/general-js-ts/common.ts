export async function sleep(msec: number) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

export function weak(element: HTMLElement | undefined) {
	return element ? new WeakRef(element) : undefined;
}
