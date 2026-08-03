<script lang="ts">
	import HamburgerIcon from '$lib/assets/icons/HamburgerIcon.svelte';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import { hotkey } from '$lib/engine/hotkeys/hotkey-helpers';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
	import { NavigationKeysConfigSets } from '$lib/engine/keyboard-navigation/types';
	import IconButton from '$lib/ui/basic-components/IconButton.svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	type Props = {
		sidebar: Snippet;
		main: Snippet;
		title?: Snippet;
		breakpoint?: number;
		sidebarWidth?: string;
		collapsedWidth?: string;
		defaultOpen?: boolean;
		persistKey?: string;
	};

	let {
		sidebar,
		main,
		title,
		breakpoint = 1024,
		sidebarWidth = '280px',
		collapsedWidth = '56px',
		defaultOpen = true,
		persistKey = 'sidebar-app-shell'
	}: Props = $props();

	let isOverlay = $state(false);
	// svelte-ignore state_referenced_locally
	let isSidebarOpen = $state(defaultOpen);

	function readStoredDesktopState(): boolean {
		try {
			const stored = localStorage.getItem(persistKey);
			return stored !== null ? JSON.parse(stored) : defaultOpen;
		} catch {
			return defaultOpen;
		}
	}

	function writeStoredDesktopState(next: boolean) {
		// TODO AZ use repo or better design
		try {
			localStorage.setItem(persistKey, JSON.stringify(next));
		} catch {}
	}

	function toggleSidebar() {
		const next = !isSidebarOpen;
		isSidebarOpen = next;

		if (!isOverlay) {
			writeStoredDesktopState(next);
		}
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}

	onMount(() => {
		const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

		function applyMode(matches: boolean) {
			isOverlay = matches;

			if (isOverlay) {
				isSidebarOpen = false;
				return;
			}

			isSidebarOpen = readStoredDesktopState();
		}

		applyMode(mq.matches);

		const onChange = (event: MediaQueryListEvent) => {
			applyMode(event.matches);
		};

		mq.addEventListener('change', onChange);

		return () => {
			mq.removeEventListener('change', onChange);
		};
	});
</script>

<div
	class="shell"
	class:overlay={isOverlay}
	class:desktop={!isOverlay}
	class:open={isSidebarOpen}
	class:closed={!isSidebarOpen}
	style:--sidebar-width={sidebarWidth}
	style:--collapsed-width={collapsedWidth}
>
	<NavigationScope
		navigationKeys={NavigationKeysConfigSets.Vertical}
		scopeName="sidebar-navigation-scope"
		class="sidebar"
	>
		<aside id="app-shell-sidebar" aria-hidden={isOverlay && !isSidebarOpen}>
			{#if !isOverlay || isSidebarOpen}
				<div class="sidebar-header">
					{#if isSidebarOpen && title}
						<div class="sidebar-title">
							{@render title()}
						</div>
					{:else}
						<div class="sidebar-title-spacer"></div>
					{/if}

					<IconButton
						class="sidebar-toggle"
						type="button"
						aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
						aria-expanded={isSidebarOpen}
						aria-controls="app-shell-sidebar"
						onclick={toggleSidebar}
						tabindex={-1}
						{@attach createClickHotKeyAttachment('Open Sidebar', false, hotkey('o', 'alt'))}
					>
						<HamburgerIcon />
					</IconButton>

					{#if isOverlay && isSidebarOpen}
						<IconButton
							class="sidebar-close"
							type="button"
							aria-label="Close sidebar"
							onclick={closeSidebar}
							tabindex={-1}
						>
							<HamburgerIcon />
						</IconButton>
					{/if}
				</div>
			{/if}

			{#if isSidebarOpen}
				<div class="sidebar-content">
					{@render sidebar()}
				</div>
			{/if}
		</aside>
	</NavigationScope>

	<NavigationScope
		class="main-content"
		scopeName="main-navigation-scope"
		navigationKeys={NavigationKeysConfigSets.Vertical}
	>
		<div>
			{@render main()}
		</div>
	</NavigationScope>
</div>

<style>
	.shell {
		--current-sidebar-width: var(--sidebar-width);
		--sidebar-pad-inline: var(--space-2);
		--sidebar-pad-block: 12px;
		--sidebar-header-height: 64px;

		position: relative;
		display: grid;
		grid-template-columns: var(--current-sidebar-width) minmax(0, 1fr);
		block-size: 100%;
		max-block-size: 100dvh;
		min-block-size: 0;
		min-inline-size: 0;
		overflow: hidden;
	}

	.shell.desktop.open {
		--current-sidebar-width: var(--sidebar-width);
	}

	.shell.desktop.closed {
		--current-sidebar-width: var(--collapsed-width);
	}

	.shell.desktop {
		transition: grid-template-columns 0.18s ease;
	}

	.shell.overlay {
		--current-sidebar-width: 0px;
		overflow: hidden;
	}

	:global(.sidebar) {
		min-inline-size: 0;
		min-block-size: 0;
		overflow: hidden;
		scrollbar-gutter: stable;
		background-color: var(--cl-bg);
		display: flex;
		flex-direction: column;

		& > aside {
			flex: 1 1 auto;
			min-inline-size: 0;
			min-block-size: 0;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}
	}

	.sidebar-header {
		position: sticky;
		inset-block-start: 0;
		background-color: var(--cl-surface);
		display: flex;
		align-items: center;
		gap: 8px;
		min-block-size: var(--sidebar-header-height);
		padding-block: var(--sidebar-pad-block);
		padding-inline: calc(var(--sidebar-pad-inline) + var(--space-2));
		box-sizing: border-box;
		flex: 0 0 auto;
	}

	.sidebar-title {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.sidebar-title-spacer {
		flex: 1;
		min-inline-size: 0;
	}

	:global(.sidebar-toggle) {
		margin-inline-start: auto;
	}

	.sidebar-content {
		flex: 1 1 auto;
		min-block-size: 0;
		overflow: auto;
		padding: 0 var(--sidebar-pad-inline) var(--sidebar-pad-block);
		box-sizing: border-box;
	}

	:global(.main-content) {
		min-inline-size: 0;
		min-block-size: 0;
		min-block-size: 100%;
		padding: var(--sidebar-header-height) 16px 16px;
		box-sizing: border-box;
	}

	.shell.overlay :global(.sidebar) {
		position: fixed;
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: min(85vw, var(--sidebar-width));
		max-inline-size: 100%;
		overflow: auto;
		transform: translateX(-100%);
		transition: transform 0.18s ease;
	}

	.shell.overlay.open :global(.sidebar) {
		transform: translateX(0);
	}
</style>
