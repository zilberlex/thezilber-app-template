import { NavigationKeyConsts } from '../hotkeys/consts';
import type { NavigationScopeOptions } from './types';

export const NavigationKeysConfigSets = {
	Horizontal: {
		prevKeys: [NavigationKeyConsts.ArrowLeft],
		nextKeys: [NavigationKeyConsts.ArrowRight]
	},
	Vertical: {
		prevKeys: [NavigationKeyConsts.ArrowUp],
		nextKeys: [NavigationKeyConsts.ArrowDown]
	},
	TwoD: {
		prevKeys: [NavigationKeyConsts.ArrowUp, NavigationKeyConsts.ArrowLeft],
		nextKeys: [NavigationKeyConsts.ArrowDown, NavigationKeyConsts.ArrowRight]
	}
};

export const NAVIGATION_SCOPE_DEFAULTS = {
	navigationKeys: NavigationKeysConfigSets.Vertical,
	discoveryMode: 'auto',
	escapeMode: 'circular',
	refresh: {
		mode: 'automatic',
		observerOptions: {
			childList: true,
			subtree: true
		}
	}
} satisfies Required<NavigationScopeOptions>;
