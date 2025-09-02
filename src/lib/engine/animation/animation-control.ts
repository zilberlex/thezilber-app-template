export type AnimationControl<T> = {
	start(animationParams?: Partial<T>): void;
	stop(): void;
	pause(): void;
	resume(): void;
	currentAnimationParams: T;
	readonly running: boolean;
	readonly paused: boolean;
	readonly animationRuntime: number;
};

export type AnimationCallback<T> = (
	dt: number,
	elapsed: number,
	ctl: AnimationControl<T>,
	animationParams: T
) => boolean; // false => stop; true/void => keep going

export function createAnimationControl<T>(cb: AnimationCallback<T>, initialParams: T): AnimationControl<T> {
	let rafId = 0;
	let _running = false;
	let _paused = false;
	let last = 0;
	let _startAt = 0;
	let _pausedAt: number | null = null;
	let _pausedTotal = 0;

	let _animationParams: T = initialParams;

	function hardStop() {
		_running = false;
		_paused = false;
		console.log('stop total runtime', performance.now() - _startAt);
		cancelAnimationFrame(rafId);
	}

	const ctl: AnimationControl<T> = {
		start(animationParams?: Partial<T>) {
			if (_running && !_paused) return;
			_startAt = performance.now();
			_running = true;
			_paused = false;

			if (animationParams) {
				_animationParams = {
					..._animationParams,
					...animationParams
				};
			}

			last = 0; // avoid giant first dt after a pause
			rafId = requestAnimationFrame(loop);
		},
		stop() {
			if (!_running) return;				
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
		get animationRuntime() { return performance.now() - _startAt; },
		get currentAnimationParams() { return _animationParams; }
	};

	function loop(now: number) {
		if (!_running || _paused) return;
		const dt = last ? now - last : 16.6667;
		last = now;

		const elapsed = now - _startAt - _pausedTotal;

		const r = cb(dt, elapsed, ctl, _animationParams);
		if (r === false) {
			hardStop(); // ensure running=false so start() can work again
			return;
		}
		if (!_running || _paused) return; // in case cb paused/stopped
		rafId = requestAnimationFrame(loop);
	}

	return ctl;
}
