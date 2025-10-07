export type AnimationTween = (t: number) => number;

export type AnimationTweenFactory = (from: number, to: number) => AnimationTween;

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