import { tick } from "svelte";
import type { AnimationControl } from "../animation-control";
import { cmpDigitAtPos, indexOfMsdDiff, segmentedRemap, type RangeMaps } from "../math-utils";
import { createTBasedAnimationControl, type TweenAnimationParams, type ValCb } from "./tweens";

function makeMapRangesTicksBased(from: number, to: number): RangeMaps {
    
    let cases = [{from: from, to: to}];
    if (from * to < 0) {
        cases = [{from: from, to: 0}, {from: 0, to: to}];
    }
    
    const rangesByCase = [];

    for (const splitCase of cases) {
        const ranges = makeCountingEffect(splitCase.from, splitCase.to);
        rangesByCase.push(ranges);
    }

    const firstCase = rangesByCase[0];
    const secondCase = rangesByCase[1];
    
    const ret = firstCase;
    let startTickSecondCase = firstCase[firstCase.length - 1].fromRange[1];
    secondCase?.forEach(rangeMap => {
        const dTicks = rangeMap.fromRange[1] - rangeMap.fromRange[0];
        const endTickSecondCase = startTickSecondCase + dTicks;
        rangeMap.fromRange[0] = startTickSecondCase;
        rangeMap.fromRange[1] = endTickSecondCase;

        startTickSecondCase = endTickSecondCase;

        ret.push(rangeMap);
    });

    return firstCase;
}

function makeCountingEffect(from: number, to: number) {
    let makeNegative = false;
    if (from < 0 || to < 0) {
        makeNegative = true;
        [from, to] = [-from, -to];
    }
    
    if (from === to) {
        return [{fromRange: [0, 1], toRange: [from, from]}];
    }
    
    const asc = from < to;
    [from, to] = asc ? [from, to] : [to, from];

    let ranges: RangeMaps = countingByDigitsEffectAscCase(from, to);
    
    // Flips ranges in desecnding cases.
    if (!asc) {
        ranges = ranges.map(rangeMap => 
                            ({fromRange: rangeMap.fromRange, 
                            toRange: [rangeMap.toRange[1], rangeMap.toRange[0]]}))
                        .reverse();

        let curFrom = 0;
        for (let i = 0; i < ranges.length; i++) {
            const dTicks = ranges[i].fromRange[1] - ranges[i].fromRange[0];
            
            ranges[i].fromRange = [curFrom, curFrom + dTicks];
            curFrom += dTicks;
        }
    }

    if (makeNegative) {
        ranges = ranges.map(rangeMap => 
                                ({fromRange: rangeMap.fromRange, 
                                toRange: [-rangeMap.toRange[0], -rangeMap.toRange[1]]}));
    }

    return ranges;
}

function countingByDigitsEffectAscCase(from: number, to: number) {
    if (from === to) return [{fromRange: [0, 1], toRange: [from, from]}];

    const ranges: RangeMaps = [];

    let ticksTotal = 0;

    let step = 1;
    let currentNum = from;

    const indexOfDiffStart = indexOfMsdDiff(from, to);
    const endPos = indexOfDiffStart;

    console.log('WOW animateNumberByDigits - indexOfDiffStart', indexOfDiffStart);

    // *** Maps counting to most significat digit *** 
    // ie 123 -> 345:
    //   123 -> 130
    //   130 -> 200
    //   200 -> 300
    for (let pos = 0; pos <= endPos; pos++) {
        const curDigit = (currentNum / step) % 10;

        let ticksCurrent = 0;
        if (pos !== endPos) {
                ticksCurrent = 10 - curDigit;
        } else {
            ticksCurrent = Math.floor((to / step)) % 10 - curDigit;
        }

        if (cmpDigitAtPos(to, currentNum, endPos) <= 0) {
            // Upstream: 990 -> 1012 - : 990 -> 1000
            // This case is special to avoid counting towards a digit which is already set.
            // This is a bit confusing and hacky, but it works.
            // Effectively skips every loop iteration now and skips to the next step.
            ticksCurrent = 0;
        }

        const nextNum = currentNum + (ticksCurrent) * step;
        if (ticksCurrent !== 0) {
            ranges.push({ fromRange: [ticksTotal, ticksTotal + ticksCurrent], toRange: [currentNum, nextNum] });
        }
        
        currentNum = nextNum;
        ticksTotal += ticksCurrent;
        step *= 10;
    }
    
    console.log('WOW animateNumberByDigits after most significant - ticksTotal', ticksTotal, 'currentNum', currentNum, 'ranges', ranges);

    // *** Maps counting the rest of digits ***
    // ie 123 -> 345:
    //  Previous Step: 123 -> 300
    //   123 -> 130
    //   130 -> 200
    //   200 -> 300
    //  This Step: 300 -> 345:
    //   300 -> 340
    //   340 -> 345
    step = 10 ** endPos;
    for (let pos = endPos - 1; pos >= 0; pos--) {
        step /= 10;
        const curDig = (Math.floor(to / step)) % 10;

        const ticksCurrent = curDig;

        const nextNum = currentNum + (ticksCurrent) * step;

        if (ticksCurrent !== 0) {
            ranges.push({ fromRange: [ticksTotal, ticksTotal + ticksCurrent], toRange: [currentNum, nextNum] });
        }

        ticksTotal += ticksCurrent;

        currentNum = nextNum;
    }

    return ranges;
}

export function animateNumberByDigits(valCb: ValCb, initialParams: TweenAnimationParams): AnimationControl<TweenAnimationParams> {
    let {from, to} = initialParams;

    [from, to] = [Math.floor(from), Math.floor(to)];

    console.log('WOW animateNumberByDigits - from', from, 'to', to);

    const lerpRanges = makeMapRangesTicksBased(from, to);
    console.log('WOW animateNumberByDigits - lerpRanges', lerpRanges);
    const ticksTotal = lerpRanges[lerpRanges.length - 1].fromRange[1];

    return createTBasedAnimationControl((t, _params) => {
        const tick = t * ticksTotal;
        const tweenedVal = segmentedRemap(lerpRanges, tick);
        
        valCb(tweenedVal);
    }, initialParams);
}

// Testing
// 
// let [from, to] = [9900, -100];
// let [from, to] = [10, -15];
// let [from, to] = [-255, -242];
// let [from, to] = [242,253];
// let [from, to] = [1225, 1225];
// let [from, to] = [0, 999];
let [from, to] = [990, 1012];

let ranges = makeMapRangesTicksBased(from, to);
console.log('for', from, '-', to);
console.log(ranges);

// let diff = indexOfMsdDiff(from, to);
// console.log('diff', diff);

let anim = animateNumberByDigits(v => console.log(v), { from: from, to: to, duration: 500 });
// anim.start();