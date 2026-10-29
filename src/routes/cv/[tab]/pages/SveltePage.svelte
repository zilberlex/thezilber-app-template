<script>
	import { TrackingElement3D } from '../../../../../../svelte-ascend/packages/elements-3d/dist/index.d.ts';
	import SvelteIcon from './SvelteIcon.svelte';
	import IconSurface3D from './IconSurface3D.svelte';
	import { componentRenderable } from '../../../../../../svelte-ascend/packages/advanced-svelte/dist/composable-renderable/index.d.ts';
	import '../styles/tokens.css';
	import '../styles/disclosure.css';
</script>

<main>
	<div class="top">
		<h1 class="doc-title">Svelte Experience</h1>

		<TrackingElement3D surface={componentRenderable(IconSurface3D)}>
			<SvelteIcon --size="48px" />
		</TrackingElement3D>
	</div>

	<h2>Agent Assistent Coding:</h2>

	<h3>Overview</h3>
	<ul>
		<li>Coded in Svelte independentaly for past two years, with projects of varied success:</li>
		<li>Personal Blog</li>
		<li>A small library for composing svelte transitions.</li>
		<li>
			An Application Framework
			<ul>
				<li>Components for plug and forget Keyboard Control</li>
				<li>Standardized Styling Optimized for Keyboard Feedback</li>
				<li>A single API point for bootstrapping applications with everything needed for Local First Apps</li>
				<li>UI Layring for modals, menus, and debugging</li>
				<li>Styling System</li>
				<li>Undo functionality, supporting async operations, optimistic updates, and error handling</li>
				<li>Standardized Event Handling</li>
			</ul>
		</li>
	</ul>

	<h3>SvelteKit based Application Infrastructure</h3>
	<h4>Manually Coded (AI assisted):</h4>
	<ul>
		<li>Coding by hand of various parts of a personal Infrastructure for local first applications</li>
		<li>Prioritized fast functionality and prototyping</li>
		<li>Slowing down and planning carefully systems hit roadblocks and complexity.</li>
		<li>Written code and systems by hand.</li>
		<li>Took developer ergonomics and code readability serioiusly.</li>
		<li>Over time - Split code into packages with clear dependencies, api, and functionality.</li>
	</ul>

	<h2>Fully Autonomous Agentic Coding</h2>

	<h3>Overview</h3>

	<ul>
		<li>Used Agents to Fully Code Local First Application (see below)</li>
		<li>Improvement of code quality and readability with agentic passes</li>
		<li>Architecute inspection and manual review by asking for sequance diagrams for different flows</li>
		<li>
			Performance Checks manually by creating inspection environments with clear visual indicators, toggles, and
			interactive elements
		</li>
	</ul>

	<details class="disclosure">
		<summary>Fully featured local first application infrastructure</summary>
		<ul>
			<li>
				Apps Developed:
				<ul>
					<li>Note Taking App</li>
					<li>Linux Command Builder</li>
					<li>Other Applications can be built quickly on demand</li>
				</ul>
			</li>
			<li>
				Features:
				<ul>
					<li>Keyboard Navigation and Intuitive UI Integration</li>
					<li>Reactive Search</li>
					<li>Tagging</li>
					<li>Record Synchonization Across Devices</li>
					<li>Command Menu</li>
					<li>Full Theming Support</li>
					<li>Options Menu</li>
					<li>UI Performance Indicators (FPS, Memory, Navigation Speed)</li>
				</ul>
			</li>
			<li>
				Storage:
				<ul>
					<li>RxDB Storage.</li>
					<li>Could plug other storages if necessary. (Syncing may need to be implemented independentaly)</li>
				</ul>
			</li>
			<li>
				Collection Scale
				<ul>
					<li>10K records - Instant load, instant search</li>
					<li>
						100K records - Instant load, instant search for early hits, practical search for rare hits (up to 8 seconds
						- limited by RxDB Reading Speeds)
					</li>
				</ul>
			</li>
			<li>
				Multiple Collection Management
				<ul>
					<li>Switching Collections</li>
					<li>Syncing Remote Collections</li>
					<li>Importing External Collection (From Exported File or From Remote Source)</li>
				</ul>
			</li>
			<li>
				Background Syncing:
				<ul>
					<li>Dropbox - To user's personal Dropbox, no storage of user data.</li>
					<li>*Planned* - Personal Hosted Storage Server. (MultiTenant)</li>
					<li>Other sources can plugged in for support when needed</li>
				</ul>
			</li>
			<li>
				Client Side Custom Search Engine:
				<ul>
					<li>
						Different Index implementation support:
						<ul>
							<li>Word Index (inverted index)</li>
							<li>Flex Search (used as an index and a ranking algorithm.)</li>
							<li>More Optimized Indexes can be developed but deemed practically unnecessary.</li>
						</ul>
					</li>
					<li>
						Performance:
						<ul>
							<li>Pagination Support</li>
							<li>Instant Ui Feedback (Number of records found, and records scanning)</li>
							<li>10K Records - Instant Results</li>
							<li>
								100K Records - Instart Records for early found records, up to 8 seconds on rare records or full database
								scan (RxDB)
							</li>
							<li>
								Memory Footprint (for using simple Word Index, Fully Indexed):
								<ul>
									<li>
										Testing Parameters (Practical Worst Case):
										<ul>
											<li>Using Word Index</li>
											<li>Fully Indexed Eagerly</li>
											<li>Notes with 1000 Words</li>
										</ul>
									</li>
									<li>
										Memory:
										<ul>
											<li>10K Records - 30Mb</li>
											<li>100K Records - 300Mb</li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</li>
		</ul>
	</details>
</main>

<style>
	main {
		padding: var(--space-8);
		max-width: 800px;
		margin: auto;
	}

	.top {
		display: flex;
		justify-content: space-between;
	}

	ul {
		margin-bottom: var(--space-4);
	}

	li::marker {
		color: var(--color);
	}

	h1,
	h2 {
		margin-top: var(--space-8);
	}
</style>
