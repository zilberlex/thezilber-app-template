import { fade, slide, type TransitionConfig } from 'svelte/transition';
import { cubicOut, sineOut } from 'svelte/easing';
import { typewriter } from '../../../typewriter';
import type { AnyTransition, ComposedTransition, SubtransitionDefinitions } from '../compose-transitions-common';

declare function composeTransitions<Transitions extends Record<string, AnyTransition>>(
	definitions: SubtransitionDefinitions<Transitions>
): ComposedTransition<Transitions>;

declare function highlight(node: Element, params: { color: string }): TransitionConfig;

declare const node: Element;

const logLineIn = composeTransitions({
	slide: { transition: slide, params: { duration: 300, axis: 'y', easing: cubicOut } },
	fade: { transition: fade, params: { duration: 400, easing: sineOut } },
	typewriter: { transition: typewriter, params: { delay: 50, speed: 4 } }
});

logLineIn(node);
logLineIn(node, { delay: 100, composedParams: { fade: { duration: 600 }, typewriter: { speed: 8 } } });
logLineIn(node, { duration: 900, composedParams: { slide: { reverse: true } } }, { direction: 'in' });

// @ts-expect-error
logLineIn(node, { composedParams: { blur: { duration: 100 } } });
// @ts-expect-error
logLineIn(node, { composedParams: { slide: { axis: 'z' } } });
// @ts-expect-error
logLineIn(node, { composedParams: { typewriter: { speed: 'fast' } } });

composeTransitions({
	// @ts-expect-error
	fade: { transition: fade, params: { axis: 'y' } }
});

composeTransitions({ fade: { transition: fade } });

const twoFades = composeTransitions({
	firstFade: { transition: fade, params: { duration: 200 } },
	secondFade: { transition: fade, params: { delay: 200 } }
});
twoFades(node, { composedParams: { secondFade: { delay: 400 } } });

const highlighted = composeTransitions({ highlight: { transition: highlight, params: { color: 'gold' } } });
highlighted(node, { composedParams: { highlight: { duration: 300 } } });

// @ts-expect-error
composeTransitions({ highlight: { transition: highlight } });
// @ts-expect-error
composeTransitions({ highlight: { transition: highlight, params: { delay: 10 } } });

const highlightedLogLine = composeTransitions({
	logLine: { transition: logLineIn, params: { composedParams: { fade: { duration: 200 } } } },
	highlight: { transition: highlight, params: { color: 'gold', delay: 300 } }
});
highlightedLogLine(node, { composedParams: { logLine: { delay: 50, composedParams: { typewriter: { speed: 2 } } } } });

// @ts-expect-error
highlightedLogLine(node, { composedParams: { logLine: { composedParams: { blur: {} } } } });
