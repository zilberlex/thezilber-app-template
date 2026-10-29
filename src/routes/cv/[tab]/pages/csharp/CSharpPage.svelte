<script>
	import { TrackingElement3D } from '../../../../../../../svelte-ascend/packages/elements-3d/dist/index.d.ts';
	import CSharpIcon from './CSharpIcon.svelte';
	import IconSurface3D from '../IconSurface3D.svelte';
	import { componentRenderable } from '../../../../../../../svelte-ascend/packages/advanced-svelte/dist/composable-renderable/index.d.ts';
	import '../../styles/index.css';

	const skills = [
		'Feature development',
		'HLD & LLD',
		'Performance optimization',
		'Testing',
		'Big data',
		'Multi-service systems',
		'Azure',
		'Grafana dashboards'
	];

	const tools = [
		'Visual Studio 2017–2022',
		'ReSharper',
		'Postman',
		'Grafana',
		'CI/CD (TFS, Git)',
		'Azure Data Explorer',
		'Docker',
		'VS Code',
		'Valgrind (C)'
	];
</script>

<main class="page prose">
	<header class="page-header hero">
		<div>
			<p class="eyebrow">Experience · C# / .NET</p>
			<h1 class="page-title">C# Backend Experience</h1>
			<p class="lead">
				Four years of backend development in C# and .NET, building performance-critical features over large datasets in
				Azure and on-premises Windows environments.
			</p>
		</div>

		<TrackingElement3D surface={componentRenderable(IconSurface3D)}>
			<CSharpIcon --size="48px" />
		</TrackingElement3D>
	</header>

	<section>
		<h2><span class="heading-index">01</span>Varonis Systems</h2>
		<p class="role">
			Software Engineer <span class="tag">2020 – 2024</span>
		</p>
		<p>A cybersecurity company - worked in a corporate environment.</p>

		<h3>Role</h3>
		<ul class="list">
			<li>
				<strong>Lead engineer</strong> on several key features that generate aggregated report summaries from vast datasets
			</li>
			<li>Owned design (HLD and LLD) through development, automation and production monitoring</li>
			<li>Integrated with other services over REST APIs and asynchronous, queue-based messaging</li>
		</ul>

		<h3>Areas:</h3>
		<dl class="definition-grid">
			<dt>Data</dt>
			<dd>Batch processing across large amounts of data stored in Data Lake and Azure Data Explorer (ADX)</dd>

			<dt>Processing</dt>
			<dd>In-memory report summaries, built for performance-critical paths</dd>

			<dt>Storage</dt>
			<dd>SQL persistence layer</dd>

			<dt>Integration</dt>
			<dd>REST APIs between services, queues for asynchronous communication</dd>

			<dt>Testing</dt>
			<dd>
				<ul class="list list-compact">
					<li>Unit and integration tests for each feature</li>
					<li>System tests added to an existing framework</li>
					<li>Memory-leak verification through tests and debugging</li>
				</ul>
			</dd>

			<dt>Monitoring</dt>
			<dd>Production cloud monitoring with ADX logs and Azure Log Analytics; KPIs visualized in Grafana</dd>
		</dl>
	</section>

	<section>
		<h2><span class="heading-index">02</span>Skills &amp; Tools</h2>

		<h3>Skills</h3>
		<ul class="tag-list">
			{#each skills as skill (skill)}
				<li>{skill}</li>
			{/each}
		</ul>

		<h3>Environments</h3>
		<ul class="tag-list">
			<li>Azure (cloud)</li>
			<li>Windows (on-premises)</li>
		</ul>

		<h3>Tools</h3>
		<ul class="tag-list">
			{#each tools as tool (tool)}
				<li>{tool}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2><span class="heading-index">03</span>Education</h2>

		<dl class="definition-grid">
			<dt>2015–2019</dt>
			<dd>
				<strong>B.Sc. in Applied Biology</strong>
				<p class="note">Hochschule Bonn-Rhein-Sieg</p>
			</dd>

			<dt>2019</dt>
			<dd>
				<strong>Certified Software Developer</strong>
				<p class="note">Infinity Labs</p>
			</dd>
		</dl>
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

	.role {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);

		color: var(--cl-on-surface);
		font-weight: var(--font-weight-semibold);
	}

	@container (width < 520px) {
		.hero {
			flex-direction: column-reverse;
		}
	}
</style>
