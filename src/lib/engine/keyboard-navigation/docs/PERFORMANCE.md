# Keyboard Navigation Performance

The main performance cost in the keyboard-navigation infrastructure comes from:

```text
target discovery
+
target refresh
+
resolving targets to focusable DOM nodes
```

Normal keyed target lookup is comparatively cheap.

For explicitly designed or frequently changing interfaces:

> Prefer `discoveryMode="marked"` with the Svelte `markForNavigation` attachment.

The main advantage of marked mode is **more selective invalidation and a smaller explicit target set**. It does not eliminate DOM subtree traversal during discovery.

---

## Performance model

Useful terms:

```text
D = number of DOM descendants in a scope
n = number of discovered navigation targets
s = number of remembered scope entries
```

A target may also require descendant traversal if its marked element is not itself focusable.

The main costs are therefore roughly:

```text
discovery
→ depends on D

target collection rebuild
→ depends on n

target resolution
→ depends on whether targets are directly focusable

scope switching
→ depends on s and candidate-scope target resolution
```

---

## Discovery modes

### `all-focusable`

`all-focusable` is the default.

```svelte
<NavigationScope scopeId="settings">
	<button>Save</button>
	<a href="/account">Account</a>
	<input />
</NavigationScope>
```

Discovery searches the scope subtree for focusable candidates such as:

```text
a[href]
button
input
select
textarea
summary
[tabindex]
[contenteditable="true"]
```

Candidates are then filtered for conditions such as:

```text
disabled
tabindex="-1"
inert
```

Automatic refresh observes:

```text
childList
href
disabled
tabindex
contenteditable
inert
```

Any observed child-list mutation invalidates discovery.

Relevant attribute mutations also invalidate discovery.

This mode is convenient because no navigation-specific authoring is required.

Use it when:

- most focusable elements should participate;
- the scope is simple enough that broad automatic discovery is useful;
- explicit target authoring would add unnecessary work.

---

### `marked`

In Svelte, marked discovery is authored with `markForNavigation`:

```svelte
<script lang="ts">
	import { markForNavigation } from '$lib/engine/keyboard-navigation/svelte-components/attachments';
</script>

<NavigationScope scopeId="records" discoveryMode="marked">
	{#each records as record (record.id)}
		<button {@attach markForNavigation(record.id)}>
			{record.name}
		</button>
	{/each}
</NavigationScope>
```

Only elements marked through:

```svelte
{@attach markForNavigation()}
```

or:

```svelte
{@attach markForNavigation(id)}
```

become navigation targets.

Marked discovery searches for:

```text
[data-navigation-target]
```

inside the scope.

### Why marked mode can perform better

The strongest performance difference is **mutation invalidation**.

For child mutations, marked mode checks whether the added or removed subtree actually contains a marked navigation target:

```text
DOM mutation
    ↓
contains marked target?
    ├── no  → ignore
    └── yes → refresh
```

Unrelated DOM changes can therefore be ignored.

By comparison, `all-focusable` treats every observed child-list mutation as potentially affecting navigation.

Marked mode also limits the resulting navigation collection to explicitly authored targets.

### Important limitation

Marked discovery still performs a DOM subtree query when discovery runs.

Conceptually:

```text
all-focusable
→ query scope descendants for focusable candidates

marked
→ query scope descendants for marked targets
```

So:

> `marked` should not be treated as making discovery independent of DOM-tree size.

Its main benefits are:

```text
explicit target set
+
narrower invalidation
+
fewer unnecessary refreshes
```

This is especially useful in frequently changing application UIs.

---

## `markForNavigation` and performance

The two forms:

```svelte
{@attach markForNavigation()}
```

and:

```svelte
{@attach markForNavigation(record.id)}
```

have the same marked-discovery behavior.

The optional ID primarily affects **navigation identity and restoration**, not discovery performance.

Use stable IDs for correctness when a logical target may be destroyed and recreated:

```svelte
<button {@attach markForNavigation(record.id)}>
	{record.name}
</button>
```

See `README.md` for the complete identity and restoration behavior.

---

## Prefer directly focusable targets

A marked target can itself be focusable:

```svelte
<button {@attach markForNavigation(record.id)}>
	Open
</button>
```

In this case target resolution is direct:

```text
target element
→ already focusable
→ use target element
```

A non-focusable container is also supported:

```svelte
<div {@attach markForNavigation(record.id)}>
	<span>{record.name}</span>
	<button>Open</button>
</div>
```

Resolution then becomes:

```text
marked element
    ↓
is focusable?
    ├── yes → use it
    └── no
         ↓
    search descendants
         ↓
    first focusable descendant
```

The descendant search happens when the target's `navigatableNode` is resolved.

Therefore:

> Mark the actual focusable element when that naturally matches the logical navigation target.

This avoids an additional descendant query.

Do not distort otherwise appropriate markup purely for this optimization unless target-resolution cost becomes measurable.

---

## Refresh cost

A full refresh performs approximately:

```text
discover target elements
        ↓
create target objects
        ↓
rebuild ordered keyed target collection
        ↓
resolve / initialize live target metadata
        ↓
synchronize current-target state
```

### Discovery

Discovery cost depends primarily on the scope DOM subtree:

```text
~ O(D)
```

as a practical upper-level model for traversing/querying descendants.

The exact browser cost depends on selector matching and DOM structure.

### Rebuilding target storage

For `n` discovered targets:

```text
O(n)
```

targets are recreated and inserted into the ordered keyed collection.

### Target initialization

Each target is also inspected during initialization.

If targets are directly focusable, this is close to linear in the number of targets:

```text
O(n)
```

If marked targets are containers, each target may additionally search its own descendants for a focusable node.

The refresh cost can therefore be thought of as:

```text
discovery cost
+
O(n)
+
target-resolution cost
```

rather than simply `O(n)`.

---

## Automatic refresh

Automatic refresh is the default:

```ts
refreshOptions: {
	mode: 'automatic'
}
```

It uses a `MutationObserver`.

```text
DOM mutations
    ↓
NavigationDiscoveryStrategy.isInvalidatedBy()
    ↓
relevant?
    ├── no  → stop
    └── yes → refreshNavigationTargets()
```

The MutationObserver callback itself is usually not the expensive part.

The important question is:

> How often does the strategy decide that a full refresh is necessary?

This is where marked discovery normally provides its largest performance advantage.

---

## Manual refresh

Automatic observation can be disabled:

```svelte
<NavigationScope
	bind:scopeRet={scope}
	scopeId="content"
	refreshOptions={{ mode: 'manual' }}
>
	...
</NavigationScope>
```

Then refresh explicitly:

```ts
scope?.refreshNavigationTargets();
```

Manual mode removes MutationObserver-driven refreshes.

This can be useful when the application already has an exact point where navigation topology changes.

The tradeoff is correctness:

```text
DOM changes
+
application forgets to refresh
=
stale navigation topology
```

Prefer automatic refresh unless manual control provides a concrete benefit.

---

## Target storage

Each scope stores targets in an ordered keyed collection.

The intended operational characteristics are:

| Operation | Complexity |
| --- | ---: |
| Target lookup by ID | `O(1)` average |
| Target lookup by index | `O(1)` |
| Index lookup by ID | `O(1)` average |
| Ordered iteration | `O(n)` |
| Full collection rebuild | `O(n)` |

This supports both:

```text
logical identity
+
ordered traversal
```

without maintaining separate synchronized target collections.

Stable application IDs and generated IDs use the same lookup structure.

---

## Navigation inside a scope

Navigation searches from the current target until it resolves a usable target.

```text
current position
    ↓
candidate target
    ↓
resolve navigatableNode
    ↓
usable?
    ├── yes → use it
    └── no  → inspect next candidate
```

When the next target is directly usable, only a small number of targets are inspected.

When many targets cannot currently resolve to usable nodes, traversal may inspect much of the target collection:

```text
target scanning
→ O(n) worst case
```

This is only the target-scanning portion.

If inspected targets are non-focusable containers, resolving them can additionally search their descendants.

Therefore the full navigation cost is better described as:

```text
number of targets inspected
+
cost of resolving those targets
```

rather than assuming the entire operation is strictly `O(1)` or `O(n)`.

---

## Current-target resolution

The scope normally attempts to resolve the remembered target ID first.

If that target exists, it begins resolution around its current position.

If the logical target is temporarily absent, the remembered index is used as a positional starting point.

Resolving the effective current target may therefore inspect nearby targets until one has a usable focus node.

In healthy navigation topology, the remembered target itself normally resolves immediately.

---

## Scope traversal

The manager maintains ordered logical scope entries.

Moving forward or backward between scopes scans entries until it finds a live scope with a usable current target.

The manager-entry scan itself is:

```text
best case  → O(1)
worst case → O(s)
```

where:

```text
s = number of remembered scope entries
```

However, checking a candidate scope involves resolving:

```ts
candidateScope.currentNavigationTarget
```

That may itself inspect targets inside the candidate scope.

So complete scope-switch cost is:

```text
scope entries inspected
+
candidate target-resolution cost
```

In normal applications the number of scopes is expected to remain small.

---

## Remembered unmounted scopes

A logical scope entry remains in manager topology when its live scope disappears.

This preserves ordering and restoration state.

During traversal:

```text
remembered scope without live instance
→ skipped
```

A large number of permanently remembered but unmounted scope IDs would therefore increase manager traversal work.

This is unlikely to matter when the number of logical scopes remains small.

---

## Recommended configurations

### Simple UI

Use the defaults:

```svelte
<NavigationScope scopeId="settings">
	...
</NavigationScope>
```

```text
all-focusable
+
automatic refresh
```

This minimizes authoring complexity.

---

### Explicitly designed or frequently changing UI

Prefer:

```svelte
<NavigationScope scopeId="records" discoveryMode="marked">
	{#each records as record (record.id)}
		<button {@attach markForNavigation(record.id)}>
			{record.name}
		</button>
	{/each}
</NavigationScope>
```

```text
marked discovery
+
automatic refresh
+
explicit navigation targets
```

The important performance characteristics are:

```text
unrelated mutations can be ignored
+
only explicitly marked targets enter navigation storage
```

Stable IDs additionally provide stronger restoration semantics without materially changing discovery cost.

---

### Fully controlled topology

Consider:

```text
marked discovery
+
manual refresh
```

only when application code reliably knows when navigation topology changes.

This minimizes automatic refresh activity but transfers refresh correctness to the application.

---

## Optimization order

If keyboard-navigation performance becomes measurable, optimize in this order:

```text
1. Measure how often full refreshes occur.

2. Use marked discovery when unrelated DOM changes
   are triggering unnecessary refreshes.

3. Reduce unnecessary navigation targets.

4. Mark directly focusable elements when that matches
   the intended navigation model.

5. Reduce large sets of targets that cannot currently
   resolve to usable focus nodes.

6. Consider manual refresh only when automatic
   invalidation is genuinely too expensive.
```

Do not begin by optimizing target ID lookup or indexing.

Those operations are designed to be cheap; DOM discovery, refresh frequency, and target resolution are much more likely to dominate real-world cost.