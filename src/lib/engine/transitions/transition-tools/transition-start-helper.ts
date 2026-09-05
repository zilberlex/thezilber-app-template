export type TransitionInfo = {
	status: 'ongoing' | 'started' | 'ended';
	direction: 'forward' | 'backward';
};

export class TransitionStartHelper {
	#started = false;
	#ended = false;
	#startingPoint: number | undefined = undefined;
	#lastPoint: number | undefined = undefined;

	track(t: number): TransitionInfo {
		let status = 'ongoing';

		let direction = undefined;
		if (t == 0 || t == 1) {
			if (this.#ended) {
				// Transition Reversed After Finish.
				this.#restart();
			}

			if (!this.#started) {
				this.#started = true;
				this.#startingPoint = t;
				status = 'started';
				direction = t == 0 ? 'forward' : 'backward';
			} else {
				// Reached Edge After Start
				if (this.#startingPoint != t) {
					// Ended
					this.#ended = true;
					status = 'ended';
				} else {
					// Reached Edge After Start
					// a. either start 2 times in a row
					// b. or reverse direction mid flow.
					status = 'ongoing';

					if (this.#lastPoint === t) {
						direction = t == 0 ? 'forward' : 'backward';
					} else {
						direction = t - this.#lastPoint > 0 ? 'forward' : 'backward';
					}
				}
			}
		} else {
			// Basic Ongoing Case.
			status = 'ongoing';
			direction = t - this.#lastPoint > 0 ? 'forward' : 'backward';
		}

		this.#lastPoint = t;

		return {
			status,
			direction
		};
	}

	#restart() {
		this.#started = false;
		this.#ended = false;
		this.#startingPoint = undefined;
		this.#lastPoint = undefined;
	}

	tryStart(t: number): boolean {
		if (!this.#started) {
			this.#started = true;
			this.#startingPoint = t;

			if (t != 0 && t != 1) {
				throw new Error('Expected starting point to be 0 or 1 when starting ' + t);
			}

			return true;
		}

		return false;
	}

	tryEnd(t: number): boolean {
		if ((t == 0 || t == 1) && this.#startingPoint != t && !this.#ended) {
			this.#ended = true;

			return true;
		}

		return false;
	}
}
