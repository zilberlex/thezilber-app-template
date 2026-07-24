# Composable Renderable Lifecycle Spike

This is a focused manual verification spike for Svelte 5.55.x. It is intentionally separate from the production composable-renderable implementation.

## Placement

For a temporary SvelteKit route, copy this directory to:

```text
src/routes/composable-renderable-lifecycle-spike/
```

Then open:

```text
/composable-renderable-lifecycle-spike
```

Alternatively, copy the files into a library directory and render `LifecycleSpike.svelte` from an existing page.

## What it compares

1. Direct Svelte rendering with a newly allocated spread-props object.
2. A deliberately naive capture-first site that returns a new wrapper snippet for each props update.
3. A capture-first site that returns one stable wrapper snippet and updates its props reference under `untrack(...)`.
4. Two independent stable sites using the same component identity.
5. A stable site whose selected component identity can change.

`component-sites.svelte` uses a runtime snippet bridge matching the previously verified spike shape. It is experimental infrastructure, not production code.

## Manual procedure

Before pressing any update button:

1. Increment the local counter in every child.
2. Type a distinct value into every uncontrolled input.
3. Note the mount and destroy counts.

Then press **Replace shared props objects**.

Expected:

| Path | Mounts | Destroys | Root | Local state | Input |
|---|---:|---:|---|---|---|
| Direct baseline | 1 | 0 | preserved | preserved | preserved |
| Naive site | increases | increases | replaced | reset | reset |
| Stable site | 1 | 0 | preserved | preserved | preserved |

For the two-site test:

- Press **Update stable site A**. Site B must not change.
- Press **Update stable site B**. Site A must not change.

For the switchable test:

- Shared-props updates must not remount.
- Pressing **Switch component** should destroy the old child exactly once and mount the new child exactly once.

## Type and compile check

Run the route through your normal Svelte checker. If your main project contains unrelated errors, use the isolated `tsconfig.json` approach already used for the typing spike, with this directory as the only include.

## What to report back

Please provide:

- `svelte-check` errors, if any;
- the mount/destroy counts before and after props replacement;
- whether local counters survived;
- whether uncontrolled inputs survived;
- whether site A and B remained isolated;
- counts after switching the selected component twice;
- any `state_unsafe_mutation` runtime error.
