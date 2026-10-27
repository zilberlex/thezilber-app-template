<script>
	import { Element3D, TrackingElement3D } from '../../../../../../../svelte-ascend/packages/elements-3d/dist/index.d.ts';
	import SvelteIcon from '../SvelteIcon.svelte';
	import IconSurface3D from '../IconSurface3D.svelte';
	import { componentRenderable } from '../../../../../../../svelte-ascend/packages/advanced-svelte/dist/composable-renderable/index.d.ts';
	import '../../styles/index.css';

	let mainArea = $state();

	const frameworkParts = [
		'Plug-and-forget keyboard control components',
		'Standardized styling optimized for keyboard feedback',
		'A single API for bootstrapping local-first apps with everything they need',
		'UI layering for modals, menus and debugging',
		'A styling system',
		'Undo with async operations, optimistic updates and error handling',
		'Standardized event handling'
	];

	const appFeatures = [
		'Keyboard navigation',
		'Reactive search',
		'Tagging',
		'Cross-device sync',
		'Command menu',
		'Full theming',
		'Options menu',
		'Perf indicators (FPS, memory, nav speed)'
	];
</script>

<main class="page prose">
	<header class="page-header hero" bind:this={mainArea}>
		<div>
			<p class="eyebrow">Experience · Svelte</p>
			<h1 class="page-title">Svelte Experience</h1>
			<p class="lead">
				Two years of independent Svelte and SvelteKit work, from hand-written infrastructure to local-first applications
				built entirely by agents.
			</p>
		</div>

		<TrackingElement3D surface={componentRenderable(IconSurface3D)}>
			<SvelteIcon --size="48px" />
		</TrackingElement3D>
	</header>

	<section>
		<h2><span class="heading-index">01</span>Agent-Assisted Coding</h2>

		<h3>Projects</h3>
		<ul class="list">
			<li><strong>Personal blog</strong></li>
			<li><strong>Transitions library</strong>: a small library for composing Svelte transitions</li>
			<li>
				<strong>Application framework</strong>
				<ul class="list list-nested">
					{#each frameworkParts as part (part)}
						<li>{part}</li>
					{/each}
				</ul>
			</li>
		</ul>

		<h3>SvelteKit Application Infrastructure <span class="tag">Hand-written · AI-assisted</span></h3>
		<ul class="list">
			<li>Hand-coded large parts of a personal infrastructure for local-first applications</li>
			<li>Prioritized fast functionality and prototyping</li>
			<li>Learned that slowing down to plan carefully is what gets systems past roadblocks and complexity</li>
			<li>Took developer ergonomics and code readability seriously</li>
			<li>Over time, split the code into packages with clear dependencies, APIs and responsibilities</li>
		</ul>
	</section>

	<section>
		<h2><span class="heading-index">02</span>Fully Autonomous Agentic Coding</h2>

		<h3>Approach</h3>
		<ul class="list">
			<li>Used agents to fully code a local-first application (case study below)</li>
			<li>Improved code quality and readability with dedicated agentic passes</li>
			<li>
				Inspected architecture by having agents produce sequence diagrams for each flow, then reviewed them by hand
			</li>
			<li>
				Checked performance manually in purpose-built inspection environments with clear visual indicators, toggles and
				interactive elements
			</li>
		</ul>

		<details class="disclosure">
			<summary>
				Case study: local-first application infrastructure
				<span class="disclosure-hint">Apps · Features · Scale</span>
			</summary>

			<div>
				<dl class="definition-grid">
					<dt>Apps built</dt>
					<dd>
						<ul class="tag-list">
							<li>Note-taking app</li>
							<li>Linux command builder</li>
						</ul>
						<p class="note">More apps can be built quickly on demand.</p>
					</dd>

					<dt>Features</dt>
					<dd>
						<ul class="tag-list">
							{#each appFeatures as feature (feature)}
								<li>{feature}</li>
							{/each}
						</ul>
					</dd>

					<dt>Storage</dt>
					<dd>RxDB. Other storages can be plugged in if needed (syncing may need its own implementation).</dd>

					<dt>Collections</dt>
					<dd>
						<ul class="list list-compact">
							<li>Switch between collections</li>
							<li>Sync remote collections</li>
							<li>Import from an exported file or a remote source</li>
						</ul>
					</dd>

					<dt>Background sync</dt>
					<dd>
						<ul class="list list-compact">
							<li>Dropbox: syncs to the user's own Dropbox, no user data stored on my side</li>
							<li><em>Planned:</em> self-hosted, multi-tenant storage server</li>
							<li>Other sources can be plugged in when needed</li>
						</ul>
					</dd>

					<dt>Search engine</dt>
					<dd>
						<p>Client-side and custom, with pluggable indexes:</p>
						<ul class="list list-compact">
							<li>Word index (inverted index)</li>
							<li>FlexSearch, used both as an index and as a ranking algorithm</li>
						</ul>
						<p class="note">
							More optimized indexes are possible but proved unnecessary in practice. Results are paginated, and the UI
							reports records found and scanned as the search runs.
						</p>
					</dd>
				</dl>

				<h4>Performance at scale</h4>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead>
							<tr>
								<th scope="col">Records</th>
								<th scope="col">Load</th>
								<th scope="col">Search</th>
								<th scope="col">Memory*</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row">10K</th>
								<td>Instant</td>
								<td>Instant</td>
								<td>30 MB</td>
							</tr>
							<tr>
								<th scope="row">100K</th>
								<td>Instant</td>
								<td>Instant for early hits, up to 8 s for rare ones (bound by RxDB read speed)</td>
								<td>300 MB</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="note">
					* Practical worst case: plain word index, fully and eagerly indexed, notes of 1,000 words each.
				</p>
			</div>
		</details>
	</section>
</main>

<style>
	/* Page-specific layout only; element styles live in cv/styles */

	.page {
		container-type: inline-size;
		padding: var(--space-8) var(--space-6) var(--space-16);
	}

	.hero {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-6);
	}

	@container (width < 520px) {
		.hero {
			flex-direction: column-reverse;
		}
	}
</style>
