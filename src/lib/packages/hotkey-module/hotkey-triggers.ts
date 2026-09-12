export function engineButtonStepUp(input: HTMLInputElement) {
	input.stepUp();
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function engineButtonStepDown(input: HTMLInputElement) {
	input.stepDown();
	input.dispatchEvent(new Event('input', { bubbles: true }));
}
