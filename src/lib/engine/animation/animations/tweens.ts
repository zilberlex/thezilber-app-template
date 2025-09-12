import { animationControl, type AnimationControl } from "../animation-control";
import { lerp } from "../math-utils";

export type ValCb = (tweenedVal: number) => void;

export type TBasedAnimationParams = {duration: number};
export type TweenAnimationParams =  TBasedAnimationParams & {from: number, to: number};

export function tweenValue(valCb: ValCb, initialParams: TweenAnimationParams): AnimationControl<TweenAnimationParams> {
    return createTBasedAnimationControl((t, params) => {
        const tweenedVal = lerp(params.from, params.to, t);
        valCb(tweenedVal);
    }, initialParams);
}

export function createTBasedAnimationControl<T extends TBasedAnimationParams>(
    animation: (t: number, params: T) => void, initialParams: T): AnimationControl<T> {
    
    return animationControl((_, elapsed, _ctl, params) => {
        const t = Math.min(elapsed / params.duration, 1);
        
        animation(t, params);

        return t < 1;
    }, initialParams);
}

