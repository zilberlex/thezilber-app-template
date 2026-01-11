export class AutoResetValue<T> {
	#baseVal: T;
	#timer: ActionTimer;

	#val: T;

	constructor(baseVal: T, resetTimeMs: number) {
		this.#baseVal = baseVal;
		this.#val = $state(baseVal);

		const resetVal = () => (this.#val = this.#baseVal);
		this.#timer = new ActionTimer(resetVal, resetTimeMs);
	}

	get value(): T {
		return this.#val;
	}

	set value(v: T) {
		this.setWithTimeout(v);
	}

	setWithTimeout(v: T, timeoutMs?: number) {
		this.#val = v;
		this.#timer.runTimer(timeoutMs);
	}
}

export class ActionTimer {
	action;
	timeoutTimeMs;
	#timeout: ReturnType<typeof setTimeout> | undefined;

	constructor(action: () => void, timeoutTimeMs: number) {
		this.action = action;
		this.timeoutTimeMs = timeoutTimeMs;
	}

	runTimer(timeoutMs?: number) {
		clearTimeout(this.#timeout);
		this.#timeout = setTimeout(this.action, timeoutMs ?? this.timeoutTimeMs);
	}

	clearTimer() {
		clearTimeout(this.#timeout);
	}
}
