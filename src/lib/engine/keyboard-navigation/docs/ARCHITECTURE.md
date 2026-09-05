# Keyboard Navigation Architecture

The infrastructure is split into a **navigation core** and a thin **Svelte / SvelteKit adapter layer**.

```text
Svelte components / attachments / context
                ↓
         navigation core
```

The core is independent of Svelte lifecycle and rendering.

It is not yet standalone: it still depends on shared engine hotkey, focus-state, assertion, and collection infrastructure.

---

## At a glance

```text
KeyboardNavigationManager.svelte
        ↓
NavigationManager
        ↓
NavigationScopeInfraImpl
        ↓
KeyboardNavigationTarget
        ↓
focusable DOM node
```

DOM changes follow a separate refresh path:

```text
DOM mutation
    ↓
NavigationRefreshController
    ↓
NavigationDiscoveryStrategy
    ↓
NavigationScopeInfraImpl
```

The main ownership rules are:

```text
Manager owns scopes.
Scope owns targets.

Discovery decides what is a target.
Refresh decides when targets are rediscovered.

Svelte owns lifecycle and authoring integration.
Core owns navigation behavior.
```

---

## Core responsibilities

| Part | Responsibility |
| --- | --- |
| `NavigationManager` | Scope registration, ordering, switching, hotkeys, and remount restoration |
| `NavigationScopeInfraImpl` | Target discovery, intra-scope navigation, and current-target state |
| `KeyboardNavigationTarget` | Resolve a logical target to a focusable DOM node |
| `NavigationDiscoveryStrategy` | Discover targets and decide which mutations invalidate discovery |
| `NavigationRefreshController` | Automatic or manual refresh lifecycle |

---

## `NavigationManager`

`NavigationManager` owns navigation between scopes.

Conceptually:

```text
NavigationManager
└── ordered scope entries
    ├── sidebar
    ├── content
    └── actions
```

Each scope is identified by a stable `scopeId`.

A logical scope entry can remain in manager topology while the actual scope component is unmounted:

```text
"sidebar"

mounted
→ live ScopeInfra

unmounted
→ remembered logical entry

mounted again
→ new ScopeInfra reuses the same entry
```

This preserves:

```text
scope ordering
+
target restoration state
```

The manager does not inspect or own target storage inside a scope.

---

## Scope switching

The manager supports two separate forms of navigation between scopes.

### Direct scope switching

Dedicated manager hotkeys move directly between usable scopes:

```text
T
→ next scope

Shift+T
→ previous scope
```

These call the manager's next/previous-scope behavior directly.

The direct scope-switch hotkeys are independent of the navigation keys used inside scopes.

### Edge handoff

Scopes may use:

```text
escapeMode="escape"
```

to give the manager an opportunity to move to another scope when intra-scope traversal reaches an edge.

The manager uses its own `NavigationKeysConfig` to determine whether the triggering key means:

```text
previous scope
or
next scope
```

The default manager directional configuration is:

```text
ArrowUp
→ previous scope

ArrowDown
→ next scope
```

This configuration is separate from each individual scope's `navigationKeys`.

---

## `NavigationScopeInfraImpl`

A scope owns navigation targets inside one DOM region.

```text
NavigationScope
└── targets
    ├── A
    ├── B
    └── C
```

It owns the ordered target collection, current-target state, intra-scope traversal, target resolution, refresh, and restoration.

Target storage is both:

```text
ordered
+
keyed by NavigationTargetId
```

This allows traversal by position while retaining stable logical identity.

---

## `KeyboardNavigationTarget`

A target separates **logical navigation membership** from the DOM node that ultimately receives focus.

```ts
interface KeyboardNavigationTarget {
	readonly id: NavigationTargetId;

	get targetElement(): HTMLElement | undefined;
	get navigatableNode(): HTMLElement | undefined;
}
```

If the target element is itself focusable:

```text
targetElement
=
navigatableNode
```

If it is a non-focusable marked container:

```text
targetElement
    ↓
first focusable descendant
    ↓
navigatableNode
```

This allows navigation targets to represent either individual controls or larger logical UI entries.

---

## Discovery

Target discovery is strategy-based.

```text
NavigationDiscoveryStrategy
├── all-focusable
└── marked
```

Each strategy owns two decisions:

```text
Which elements are navigation targets?

Which DOM mutations require rediscovery?
```

### `all-focusable`

Discovers focusable descendants automatically.

### `marked`

Discovers explicitly authored navigation targets:

```text
[data-navigation-target]
```

Because marked discovery understands exactly which elements matter, unrelated DOM changes can often be ignored.

The scope itself does not need to know how either strategy performs discovery.

---

## Refresh

`NavigationRefreshController` controls when discovery runs.

```text
automatic
→ MutationObserver

manual
→ application calls refreshNavigationTargets()
```

Automatic flow:

```text
DOM mutation
    ↓
DiscoveryStrategy.isInvalidatedBy()
    ↓
relevant?
    ├── no
    └── yes
         ↓
refreshNavigationTargets()
```

The refresh controller does not own navigation state.

---

## Navigation flow

Normal intra-scope navigation flows through the manager and current scope:

```text
keyboard event
    ↓
NavigationManager
    ↓
current scope
    ↓
getNextNodeInfo()
    ↓
resolve next target
    ↓
focus DOM node
```

When a scope using `escape` reaches an edge:

```text
current scope
    ↓
returns escape fallback
    ↓
NavigationManager
    ↓
manager directional key?
    ├── yes → next / previous usable scope
    └── no  → wrapped fallback inside current scope
```

Direct manager scope-switch keys bypass this edge-handoff path:

```text
T / Shift+T
    ↓
NavigationManager
    ↓
next / previous usable scope
```

Browser focus also updates navigation state:

```text
focusin
    ↓
scope updates current target
    ↓
scope signals manager
    ↓
manager updates current scope
```

This keeps internal navigation state synchronized with focus changes that originate outside keyboard navigation.

---

## Restoration

Scopes remember navigation state across dynamic UI changes.

```text
scope unregisters
→ manager stores restoration point

same scopeId registers again
→ restore by target ID
→ fall back to previous index
```

Browser focus takes precedence if focus is already inside the newly mounted scope.

Restoration updates logical navigation state; it does not itself move browser focus.

---

## Svelte / SvelteKit adapters

The Svelte layer adapts the navigation core to component lifecycle and declarative authoring.

```text
Svelte layer
├── KeyboardNavigationManager.svelte
├── NavigationScope.svelte
├── navigation-manager-provider.svelte.ts
├── attachments.ts
└── sveltekit-helpers.ts
```

### `KeyboardNavigationManager.svelte`

Creates the manager and provides it through Svelte context.

Current initialization order:

```text
component initialization
→ new NavigationManager()
→ setNavigationManager()
→ manager.init()
→ children initialize
```

Manager initialization happens immediately in the browser rather than waiting for `onMount`.

This ensures the manager is initialized before descendant navigation components begin their own mount lifecycle.

Cleanup remains component-lifecycle based:

```text
onDestroy
→ manager.destroy()
```

### `NavigationScope.svelte`

Creates and registers the scope infrastructure:

```text
onMount
→ get NavigationManager from context
→ create NavigationScopeInfraImpl
→ scope.init()
→ manager.registerScope()
```

Cleanup:

```text
onDestroy
→ manager.unregisterScope()
→ scope.destroy()
```

The component also exposes the live scope through Svelte context and the optional `scopeRet` binding.

Scope options are captured when the scope is initialized; the current adapter does not reactively reconfigure a live `NavigationScopeInfraImpl`.

---

## `markForNavigation`

`markForNavigation` is the Svelte authoring adapter for marked discovery.

```svelte
<button {@attach markForNavigation(record.id)}>
	Open
</button>
```

It writes navigation metadata to the DOM:

```text
markForNavigation()
→ data-navigation-target

markForNavigation(id)
→ data-navigation-target
→ data-navigation-target-id
```

The navigation core reads those attributes without depending on Svelte attachments directly.

The behavior and identity semantics of `markForNavigation` are documented in `README.md`.

---

## Context and helpers

`navigation-manager-provider.svelte.ts` exposes manager and scope instances through Svelte context.

Conceptually:

```text
KeyboardNavigationManager
    ↓ provides
NavigationManager
    ↓ consumed by
NavigationScope
```

Individual scopes also expose their `ScopeInfra` through scope context.

`sveltekit-helpers.ts` contains Svelte-facing convenience functions built on manager context.

For example, `assignNavigationManagerKeys()` temporarily replaces the manager's direct next/previous scope-switch hotkeys and returns the corresponding cleanup function.

---

## Portability boundary

The architecture separates Svelte integration from navigation behavior:

```text
Svelte
├── components
├── context
└── attachments
        ↓
navigation core
```

However, the navigation core still depends on application engine infrastructure:

```text
NavigationManager
├── hotkey infrastructure
├── engine assertions
└── shared collection structures

navigation focus
└── navigation-state integration
```

Therefore:

```text
Svelte-independent
≠
standalone package
```

A future standalone extraction would require replacing or injecting those engine-specific dependencies.

Until that becomes a concrete requirement, the current direct integration is simpler.

---

## Architecture invariants

```text
NavigationManager owns scope topology.

NavigationScopeInfraImpl owns target topology.

scopeId identifies a logical scope across remounts.

NavigationTargetId identifies a logical target.

Discovery decides what constitutes a target.

Refresh decides when discovery runs.

Direct scope-switch hotkeys and edge-navigation keys are separate concerns.

Svelte components own lifecycle integration.

Svelte attachments own declarative target authoring.

Core navigation code should not depend on Svelte rendering semantics.
```