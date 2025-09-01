export type AnimationControl = {
	start(): void;
	stop(): void;
	pause(): void;
	resume(): void;
	readonly running: boolean;
	readonly paused: boolean;
	readonly animationRuntime: number;
};

export type AnimationCallback = (
	dt: number,
	elapsed: number,
	ctl: AnimationControl
) => boolean; // false => stop; true/void => keep going

export function createAnimationControl(cb: AnimationCallback): AnimationControl {
	let rafId = 0;
	let _running = false;
	let _paused = false;
	let last = 0;
	let _startAt = 0;
	let _pausedAt: number | null = null;
	let _pausedTotal = 0;

	function hardStop() {
		_running = false;
		_paused = false;
		cancelAnimationFrame(rafId);
	}

	const ctl: AnimationControl = {
		start() {
			if (_running && !_paused) return;
			_startAt = performance.now();
			_running = true;
			_paused = false;
			last = 0; // avoid giant first dt after a pause
			rafId = requestAnimationFrame(loop);
		},
		stop() {
			hardStop();
		},
		pause() {
			if (!_running || _paused) return;
			console.log('pause');
			_paused = true;
			cancelAnimationFrame(rafId);
		},
		resume() {
			if (!_running || !_paused) return;
			console.log('resume');
			_paused = false;
			if (_pausedAt != null) {
				 _pausedTotal += performance.now() - _pausedAt;
				_pausedAt = null; 
			}
			last = 0;
			rafId = requestAnimationFrame(loop);
		},
		get running() { return _running; },
		get paused() {
			_pausedAt = performance.now(); 
			return _paused; 
		},
		get animationRuntime() { return performance.now() - _startAt; }
	};

	function loop(now: number) {
		if (!_running || _paused) return;
		const dt = last ? now - last : 16.6667;
		last = now;

		const elapsed = now - _startAt - _pausedTotal;

		const r = cb(dt, elapsed, ctl);
		if (r === false) {
			hardStop(); // ensure running=false so start() can work again
			return;
		}
		if (!_running || _paused) return; // in case cb paused/stopped
		rafId = requestAnimationFrame(loop);
	}

	return ctl;
}
