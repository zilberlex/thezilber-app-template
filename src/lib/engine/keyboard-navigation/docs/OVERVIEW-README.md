# Keyboard Navigation

Keyboard navigation for SvelteKit applications, organized into navigable **scopes** containing ordered **navigation targets**.

## Quick start

Wrap the relevant application region with `KeyboardNavigationManager`, then define navigation scopes.

```svelte
<script lang="ts">
	import KeyboardNavigationManager from '$lib/engine/keyboard-navigation/svelte-components/KeyboardNavigationManager.svelte';
	import NavigationScope from '$lib/engine/keyboard-navigation/svelte-components/NavigationScope.svelte';
</script>

<KeyboardNavigationManager>
	<NavigationScope scopeId="sidebar">
		<button>Home</button>
		<button>Settings</button>
		<button>Account</button>
	</NavigationScope>
</KeyboardNavigationManager>
```

By default:

- focusable elements are discovered automatically;
- `ArrowUp` / `ArrowDown` navigate inside a scope;
- navigation wraps at scope edges;
- targets refresh automatically when relevant DOM changes occur;
- `T` moves to the next scope;
- `Shift+T` moves to the previous scope.

Each live scope must have a unique `scopeId`.

Navigation scopes cannot be nested.

---

## Discovery modes

A scope supports two ways of deciding which elements participate in navigation.

### `all-focusable`

This is the default.

```svelte
<NavigationScope scopeId="sidebar">
	<button>Home</button>
	<a href="/settings">Settings</a>
	<input />
</NavigationScope>
```

Standard focusable descendants are discovered automatically.

Use this when:

- the scope is relatively small;
- most focusable controls should participate;
- explicit navigation-target authoring is unnecessary.

### `marked`

For explicitly designed or frequently changing interfaces, use `marked` discovery.

In Svelte, every marked navigation target uses the `markForNavigation` attachment:

```svelte
<script lang="ts">
	import { markForNavigation } from '$lib/engine/keyboard-navigation/svelte-components/attachments';
</script>

<NavigationScope scopeId="sidebar" discoveryMode="marked">
	<button {@attach markForNavigation()}>Home</button>
	<button {@attach markForNavigation()}>Settings</button>
	<button {@attach markForNavigation()}>Account</button>
</NavigationScope>
```

Only elements using `markForNavigation` participate in marked discovery.

`marked` mode is useful when:

- only selected elements should participate;
- navigation targets are explicitly designed;
- the DOM changes frequently;
- unrelated DOM mutations should not trigger navigation rediscovery.

For explicitly designed application navigation, `marked` is generally the preferred mode.

---

## Stable navigation targets

`markForNavigation` can also give a target a stable application-owned identity.

An ordinary marked target:

```svelte
<button {@attach markForNavigation()}>
	Open
</button>
```

receives an automatically generated ID.

That ID remains stable while the same DOM element survives.

If the target may be destroyed and recreated, provide a stable ID:

```svelte
<button {@attach markForNavigation(record.id)}>
	{record.name}
</button>
```

The navigation target is now identified by `record.id`, rather than by a particular DOM instance.

This is especially useful for dynamic lists:

```svelte
<NavigationScope scopeId="records" discoveryMode="marked">
	{#each records as record (record.id)}
		<button {@attach markForNavigation(record.id)}>
			{record.name}
		</button>
	{/each}
</NavigationScope>
```

Use IDs that represent real application identity:

```svelte
{@attach markForNavigation(record.id)}
{@attach markForNavigation(user.id)}
```

Avoid mutable labels or display text.

### What stable IDs provide

If the current target temporarily disappears, the scope remembers it:

```text
A
B  ← current
C

B disappears

A
C

B returns with the same ID

A
B  ← restored
C
```

If the entire `NavigationScope` is removed and later mounted again with the same `scopeId`, the manager also remembers its navigation state.

Restoration prefers:

```text
stable target ID
    ↓
previous target position
```

Actual browser focus takes precedence over remembered state.

---

## Marking containers

`markForNavigation` can be attached directly to a focusable element:

```svelte
<button {@attach markForNavigation(record.id)}>
	Open
</button>
```

This is the preferred form.

A non-focusable container can also represent a navigation target:

```svelte
<div {@attach markForNavigation(record.id)}>
	<span>{record.name}</span>
	<button>Open</button>
</div>
```

In that case, navigation resolves the first focusable descendant as the node that receives focus.

Nested marked navigation targets are not supported.

---

## Configure a scope

The main scope options are:

```svelte
<NavigationScope
	scopeId="toolbar"
	discoveryMode="marked"
	navigationKeys={NavigationKeysConfigSets.Horizontal}
	escapeMode="escape"
>
	...
</NavigationScope>
```

Scope configuration is established when the scope mounts.

Changing `scopeId`, `scopeOrder`, `navigationKeys`, `discoveryMode`, `escapeMode`, or `refreshOptions` does not currently reconfigure an already initialized scope.

### Navigation keys

Built-in configurations:

```ts
NavigationKeysConfigSets.Vertical
// ↑ ↓

NavigationKeysConfigSets.Horizontal
// ← →

NavigationKeysConfigSets.TwoD
// ↑ ← / ↓ →
```

Vertical navigation is the default.

A custom configuration can also be supplied:

```ts
const navigationKeys = {
	prevKeys: ['k'],
	nextKeys: ['j']
};
```

### Edge behavior

```ts
escapeMode: 'circular' | 'escape'
```

`circular` is the default.

```text
circular
last → first

escape
edge → give the manager an opportunity to move to another scope
```

---

## Multiple scopes

Applications can contain multiple independent scopes.

```svelte
<KeyboardNavigationManager>
	<NavigationScope scopeId="sidebar">
		...
	</NavigationScope>

	<NavigationScope scopeId="content">
		...
	</NavigationScope>

	<NavigationScope scopeId="actions">
		...
	</NavigationScope>
</KeyboardNavigationManager>
```

The manager owns navigation between scopes.

A scope's `scopeId` is its stable logical identity. If the scope disappears and later returns with the same ID, its previous manager position is preserved.

### Switching scopes directly

By default:

```text
T
→ next scope

Shift+T
→ previous scope
```

These keys switch directly between usable scopes.

The manager remembers the current target inside each scope, so returning to a scope normally returns to its current logical target.

### Moving between scopes at an edge

A scope using:

```svelte
<NavigationScope
	scopeId="sidebar"
	escapeMode="escape"
>
	...
</NavigationScope>
```

allows navigation to continue into another scope when it reaches an edge.

The direction used for this manager-level handoff comes from `KeyboardNavigationManager`'s `navigationKeyConfig`.

By default:

```text
ArrowDown
→ next scope

ArrowUp
→ previous scope
```

For example, a horizontal multi-scope interface can configure both the manager and its scopes:

```svelte
<KeyboardNavigationManager
	navigationKeyConfig={NavigationKeysConfigSets.Horizontal}
>
	<NavigationScope
		scopeId="toolbar-left"
		navigationKeys={NavigationKeysConfigSets.Horizontal}
		escapeMode="escape"
	>
		...
	</NavigationScope>

	<NavigationScope
		scopeId="toolbar-right"
		navigationKeys={NavigationKeysConfigSets.Horizontal}
		escapeMode="escape"
	>
		...
	</NavigationScope>
</KeyboardNavigationManager>
```

Scope-local navigation keys and manager-level edge-navigation keys are separate configuration.

### Scope ordering

An initial order can be supplied:

```svelte
<NavigationScope scopeId="sidebar" scopeOrder={10}>
	...
</NavigationScope>

<NavigationScope scopeId="content" scopeOrder={20}>
	...
</NavigationScope>
```

`scopeOrder` establishes the logical order when a scope ID is first registered.

If the same scope later remounts, its remembered position is preserved.

`scopeOrder` is not a reactive reordering API.

---

## Refresh behavior

Targets refresh automatically by default:

```ts
refreshOptions: {
	mode: 'automatic'
}
```

Automatic refresh observes relevant DOM mutations and lets the active discovery strategy decide whether rediscovery is necessary.

For fully controlled interfaces, automatic observation can be disabled:

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

Prefer automatic refresh unless the application can reliably determine when navigation topology changes.

---

## Defaults

### Scope

```ts
{
	navigationKeys: NavigationKeysConfigSets.Vertical,
	discoveryMode: 'all-focusable',
	escapeMode: 'circular',
	refreshOptions: {
		mode: 'automatic'
	}
}
```

### Manager

```text
Direct next scope      T
Direct previous scope  Shift+T

Edge next scope        ArrowDown
Edge previous scope    ArrowUp
```

---

## `NavigationScope` reference

| Prop | Purpose |
| --- | --- |
| `scopeId` | Stable logical identity of the scope |
| `scopeOrder` | Initial manager ordering |
| `navigationKeys` | Previous / next navigation keys inside the scope |
| `discoveryMode` | `all-focusable` or `marked` |
| `escapeMode` | `circular` or `escape` |
| `refreshOptions` | Automatic or manual target refresh |
| `scopeRet` | Access to the underlying scope infrastructure |

---

## `KeyboardNavigationManager` reference

| Prop | Purpose |
| --- | --- |
| `navigationKeyConfig` | Previous / next keys used for edge navigation between scopes |
| `navigationManager` | Bindable access to the underlying manager |

Direct scope-switch hotkeys can also be changed through the manager API.

---

## Recommended starting point

For a simple UI:

```svelte
<NavigationScope scopeId="settings">
	...
</NavigationScope>
```

For an explicitly designed or dynamic UI:

```svelte
<NavigationScope scopeId="records" discoveryMode="marked">
	{#each records as record (record.id)}
		<button {@attach markForNavigation(record.id)}>
			{record.name}
		</button>
	{/each}
</NavigationScope>
```

Use stable IDs when targets represent persistent application entities.

Add `escapeMode="escape"` when directional navigation should continue into adjacent scopes.

---

## Constraints

```text
Scope IDs must be unique among live scopes.

Navigation scopes cannot be nested.

Marked navigation targets cannot be nested.

Explicit target IDs must be unique inside a live scope.

Scope configuration is currently initialization-time, not reactive.
```

---

## More

- `ARCHITECTURE.md` — implementation structure and Svelte integration
- `PERFORMANCE.md` — discovery, refresh, and traversal costs
- `TECHNICAL-DEBT.md` — deferred hardening and future work