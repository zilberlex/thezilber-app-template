import { linear } from 'svelte/easing';
import type { ComposedTransitionParams } from './compose-transitions-common';
import { type TransitionConfig } from 'svelte/transition';
import { clampedInverseLerp } from '$lib/engine/math-utils/math-utils';
import { makeFilterFunction } from '../effects';
import type { FilterEffectTransitionParams } from '../transitions-common';

function initValues(filterEffectParams: FilterEffectTransitionParams): Required<FilterEffectTransitionParams> {
	let {
		filterName,
		delay = 0,
		duration = 600,
		easing = linear,
		yoyo = true,
		baseVal = 1,
		peakVal = 2.5,
		units = ''
	} = filterEffectParams;

	if (!filterName) {
		throw new Error('filterName is required');
	}

	if (yoyo) {
		easing = pulseEase(easing);
	}

	return { filterName, delay, duration, easing, yoyo, baseVal, peakVal, units };
}

function createFilterFunctionForComposition(filterEffectsParams: Required<FilterEffectTransitionParams>) {
	const { filterName, easing, baseVal, peakVal, units } = filterEffectsParams;

	const filterFunction = makeFilterFunction(filterName, peakVal, baseVal, units);

	return (local_t_linear: number) => {
		const ret = filterFunction(easing(local_t_linear));

		return ret;
	};
}

export function composeFilterEffectsTransition(
	{ delay = 0, duration = undefined, optimizeCss = false }: ComposedTransitionParams = {},
	filterEffectsParams: FilterEffectTransitionParams[]
): (node: Element) => TransitionConfig {
	let initializedFilterEffects = filterEffectsParams.map(initValues);
	let maxDuration = initializedFilterEffects.reduce((max, { delay, duration }) => Math.max(max, delay + duration), 0);

	const globalDelay = delay;
	const baseLineDuration = maxDuration;
	const globalDuration = duration ?? baseLineDuration;

	const filterFunctionsForComposition = initializedFilterEffects.map((filterEffectsParam) => {
		const { delay: localDelay, duration: localDuration } = filterEffectsParam;

		return {
			globalStartTLinear: localDelay / baseLineDuration,
			globalEndTLinear: (localDuration + localDelay) / baseLineDuration,
			filterFunc: createFilterFunctionForComposition(filterEffectsParam)
		};
	});

	const alwaysRunCss = !optimizeCss;
	const composedFilters = (global_t_linear: number) => {
		return filterFunctionsForComposition
			.map((filterData) => {
				const { globalStartTLinear, globalEndTLinear, filterFunc } = filterData;

				if (global_t_linear == 0) {
					return filterFunc(0);
				} else if (global_t_linear == 1) {
					return filterFunc(1);
				}

				if (alwaysRunCss || (global_t_linear >= globalStartTLinear && global_t_linear <= globalEndTLinear)) {
					const local_t_linear = clampedInverseLerp(global_t_linear, globalStartTLinear, globalEndTLinear);

					return filterFunc(local_t_linear);
				}

				return null;
			})
			.filter(Boolean);
	};

	const cssFunc = (t_linear: number) => {
		const filterCss = composedFilters(t_linear);
		if (filterCss.length == 0) {
			return '';
		}

		const fullCss = `filter: ${filterCss.join(' ')}`;

		return fullCss;
	};

	return (node: Element): TransitionConfig => {
		return {
			delay: globalDelay,
			duration: globalDuration,
			easing: linear,
			css: cssFunc
		};
	};
}

function pulseEase(easing: FilterEffectTransitionParams): FilterEffectTransitionParams {
	throw new Error('Function not implemented.');
}
