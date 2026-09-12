import { createContext, getContext, setContext } from 'svelte';
import type { NavigationManager } from '../navigation-manager';
import type { NavigationScopeContext } from './types';

export const [getNavigationScopeContext, setNavigationScopeContext] = createContext<NavigationScopeContext>();
export const [getNavigationManager, setNavigationManager] = createContext<NavigationManager>();
