<script lang="ts">
	import { FlippableElement3D, TrackingElement3D } from '$lib/packages/ui/elements-3d';
	import { createHotKeyTriggerClickAttachment } from '$lib/engine/engine-hotkeys/hotkey-actions';
	import { TRACKING_MODES } from '$lib/packages/core/math/trackball-algorithms';
	import { componentRenderable, snippetRenderable } from '$lib/packages/svelte/composable-renderable';
	import { kbKey } from '$lib/packages/core/input/keyboard-key/kb-key-factories';
	import Button from '$lib/ui/basic-components/Button.svelte';
	import { createAttachmentKey } from 'svelte/attachments';

	let trackBallAlgorithsm = TRACKING_MODES;
</script>

<main class="ly-center">
	<section>
		<h3>Flipper</h3>
		<FlippableElement3D compensateFaceScale={true}>
			{#snippet face()}
				Flipper
			{/snippet}
			{#snippet backFace()}
				Back of Flipper
			{/snippet}
		</FlippableElement3D>
		<FlippableElement3D depth={-20} compensateFaceScale={true}>
			{#snippet face()}
				Flipper Negative Depth
			{/snippet}
			{#snippet backFace()}
				Back of Flipper Negative Depth
			{/snippet}
		</FlippableElement3D>
	</section>

	<section>
		<h3>Positive Depth</h3>
		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D trackingConfig={{ mode: trackingMode }} compensateFaceScale={false}>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}
	</section>

	<section>
		<h3>Negative Depth (Surface Color Transparent by design)</h3>
		{#each trackBallAlgorithsm as trackingMode}
			<TrackingElement3D
				trackingConfig={{ mode: trackingMode }}
				depth={-40}
				compensateFaceScale={true}
				style="background-color: transparent;"
			>
				Mouse Tracker {trackingMode}
			</TrackingElement3D>
		{/each}
	</section>

	<section>
		<h3>Buttons</h3>

		<TrackingElement3D surface={componentRenderable(Button)} compensateFaceScale={false}>
			Tracking Button Not Compensated
		</TrackingElement3D>

		{#snippet trackingFace()}
			Tracking Button Compensated (With Hotkey Also)
		{/snippet}
		<TrackingElement3D
			surface={componentRenderable(Button)}
			surfaceProps={{ [createAttachmentKey()]: createHotKeyTriggerClickAttachment('Click', kbKey('l', 'alt')) }}
			compensateFaceScale={true}
			face={snippetRenderable(trackingFace)}
			faceProps={{}}
		></TrackingElement3D>

		<TrackingElement3D surface={componentRenderable(Button)} compensateFaceScale={true} depth={-40}>
			Tracking Button Compensated Negative Depth
		</TrackingElement3D>
		<Button>Normal Button</Button>
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
</style>
