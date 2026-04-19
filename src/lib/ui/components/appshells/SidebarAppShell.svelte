<script lang="ts">
	import HamburgerIcon from '$lib/assets/icons/HamburgerIcon.svelte';
	import { createClickHotKeyAttachment } from '$lib/engine/hotkeys/hotkey-actions';
	import IconButton from '$lib/ui/basic-components/IconButton.svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	type Props = {
		sidebar: Snippet;
		main: Snippet;
		breakpoint?: number;
		sidebarWidth?: string;
		collapsedWidth?: string;
		defaultOpen?: boolean;
		persistKey?: string;
	};

	let {
		sidebar,
		main,
		breakpoint = 1024,
		sidebarWidth = '280px',
		collapsedWidth = '0px',
		defaultOpen = true,
		persistKey = 'sidebar-app-shell'
	}: Props = $props();

	let isOverlay = $state(false);
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
			const wasOverlay = isOverlay;
			isOverlay = matches;

			if (isOverlay) {
				isSidebarOpen = false;
				return;
			}

			if (wasOverlay && !isOverlay) {
				isSidebarOpen = readStoredDesktopState();
				return;
			}

			if (!wasOverlay && !isOverlay) {
				isSidebarOpen = readStoredDesktopState();
			}
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
	<IconButton
		class="sidebar-toggle"
		type="button"
		aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
		aria-expanded={isSidebarOpen}
		aria-controls="app-shell-sidebar"
		onclick={toggleSidebar}
		{@attach createClickHotKeyAttachment('Open Sidebar', false, 'o', 'alt')}
	>
		<HamburgerIcon />
	</IconButton>

	{#if isOverlay && isSidebarOpen}
		<IconButton class="backdrop" type="button" aria-label="Close sidebar" onclick={closeSidebar}>
			<HamburgerIcon />
		</IconButton>
	{/if}

	<aside id="app-shell-sidebar" class="sidebar" aria-hidden={isOverlay && !isSidebarOpen}>
		<div class="sidebar-scroll">
			{@render sidebar()}
		</div>
	</aside>

	<main class="main">
		<div class="main-scroll">
			{@render main()}
		</div>
	</main>
</div>

<style>
	.shell {
		--current-sidebar-width: var(--sidebar-width);

		position: relative;
		display: grid;
		grid-template-columns: var(--current-sidebar-width) minmax(0, 1fr);
		block-size: 100%;
		max-block-size: 100dvh;
		min-block-size: 0;
		min-inline-size: 0;
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
	}

	:global(.sidebar-toggle) {
		position: absolute;
		inset-block-start: 12px;
		inset-inline-start: 12px;
		z-index: 30;
	}

	.sidebar {
		min-inline-size: 0;
		min-block-size: 0;
		overflow: hidden;
	}

	.sidebar-scroll {
		block-size: 100%;
		min-block-size: 0;
		overflow: auto;
		box-sizing: border-box;
		padding: 64px 12px 12px;
	}

	.main {
		min-inline-size: 0;
		min-block-size: 0;
	}

	.main-scroll {
		block-size: 100%;
		min-block-size: 0;
		overflow: auto;
		box-sizing: border-box;
		padding: 64px 16px 16px;
	}

	.shell.desktop.closed .sidebar-scroll {
		opacity: 0;
		pointer-events: none;
		visibility: hidden;
	}

	.shell.overlay .sidebar {
		position: fixed;
		inset-block: 0;
		inset-inline-start: 0;
		z-index: 20;
		inline-size: min(85vw, var(--sidebar-width));
		max-inline-size: 100%;
		transform: translateX(-100%);
		transition: transform 0.18s ease;
	}

	.shell.overlay.open .sidebar {
		transform: translateX(0);
	}
</style>
