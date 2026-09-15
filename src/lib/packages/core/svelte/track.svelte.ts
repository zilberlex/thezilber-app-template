export function track(...params: unknown[]) {
	$state.snapshot(params);
}
