import type { AnimationCallback, AnimationControl } from './animation.types';
import { safeCaf, safeRaf } from './raf-safe';

export function animationControl<T>(
	cb: AnimationCallback<T>,
	initialParams: T
): AnimationControl<T> {
	let rafId = 0;
	let _running = false;
	let _paused = false;
	let last = 0;
	let _startAt: number | null = null;
	let _pausedAt: number | null = null;
	let _pausedTotal = 0;
	let _animationRunTime = 0;

	let _animationParams: T = initialParams;

	function hardStop() {
		_running = false;
		_paused = false;
		console.log('stop total runtime', performance.now() - _startAt);
		safeCaf(rafId);
	}

	const ctl: AnimationControl<T> = {
		start(animationParams?: Partial<T>) {
			if (_running && !_paused) return;

			_startAt = null;
			_animationRunTime = 0;
			_running = true;
			_paused = false;

			if (animationParams) {
				_animationParams = {
					..._animationParams,
					...animationParams
				};
			}

			last = 0; // avoid giant first dt after a pause
			rafId = safeRaf(loop);
		},
		stop() {
			if (!_running) return;
			hardStop();
		},
		pause() {
			if (!_running || _paused) return;
			console.log('pause');
			_paused = true;
			safeCaf(rafId);
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
			rafId = safeRaf(loop);
		},
		get running() {
			return _running;
		},
		get paused() {
			_pausedAt = performance.now();
			return _paused;
		},
		get animationRuntime() {
			return _animationRunTime;
		},
		get currentAnimationParams() {
			return _animationParams;
		}
	};

	function loop(now: number) {
		if (!_running || _paused) return;
		_startAt ??= performance.now();

		const dt = last ? now - last : 16.6667;
		last = now;

		_animationRunTime += dt - _pausedTotal;

		const r = cb(dt, _animationRunTime, ctl, _animationParams);
		if (r === false) {
			hardStop(); // ensure running=false so start() can work again
			return;
		}
		if (!_running || _paused) return; // in case cb paused/stopped
		rafId = safeRaf(loop);
	}

	return ctl;
}
