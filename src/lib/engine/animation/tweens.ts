import { createAnimationControl, type AnimationCallback, type AnimationControl } from "./animation-control";
import { lerp } from "./math-utils";

export type TweenValCb = (tweenedVal: number) => void;

export type TBasedAnimationParams = {duration: number};
export type TweenAnimationParams =  TBasedAnimationParams & {from: number, to: number};

export function tweenValue(valCb: TweenValCb, initialParams: TweenAnimationParams): AnimationControl<TweenAnimationParams> {
    return createAnimationControl(tBasedAnimationControl((t: number, params: TweenAnimationParams) => {
                                      const tweenedVal = lerp(params.from, params.to, t);
                                      valCb(tweenedVal);
                                  }), initialParams);
}

function tBasedAnimationControl<T extends TBasedAnimationParams>(animation: (t:number, params: T) => void): AnimationCallback<T> {
    return (_, elapsed, _ctl, params) => {
        const t = Math.min(elapsed / params.duration, 1);
        animation(t, params);
        return t < 1;
    };
}

