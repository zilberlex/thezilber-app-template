# Keyboard Navigation Technical Debt

Known implementation debt, deferred hardening, and possible future improvements.

The current infrastructure is functionally complete for its existing navigation model. None of the items below require immediate implementation unless they block a real use case.

---

## Deferred work summary

### Correctness / lifecycle

- [ ] Harden stale `unregisterScope(scope)` instance handling.
- [ ] Review `markForNavigation` attachment cleanup/update behavior.

### Cleanup

- [ ] Standardize canonical Svelte component names.
- [ ] Review development logging and debug DOM attributes.
- [ ] Perform a small assertion / defensive-runtime consistency audit.
- [ ] Review naming around manager directional keys vs direct scope-switch keys.

### Portability

Only if standalone extraction becomes necessary:

- [ ] Decouple engine hotkey infrastructure.
- [ ] Decouple focus/navigation-state integration.
- [ ] Define explicit adapter boundaries for engine assertions and shared infrastructure.

### Optional future features

- [ ] Dynamic scope reordering API, if required.
- [ ] Richer read-only navigation introspection.
- [ ] Target-ID convenience helpers, if repeated usage justifies them.
- [ ] Focus / activate / deactivate interaction semantics.

---

# Deferred correctness hardening

## Stale scope unregister

`NavigationManager.unregisterScope(scope)` currently resolves an entry by logical scope ID:

```ts
const entry = this.#scopeEntries.get(scope.scopeId);
```

It does not additionally verify that the supplied scope is the exact currently registered live instance.

The stronger lifecycle invariant is:

```ts
entry.scope === scope
```

before allowing the supplied instance to:

```text
save restoration state
remove navigation keys
remove focus listeners
clear entry.scope
```

Potential stale lifecycle sequence:

```text
scope A registers as "sidebar"

A begins teardown

scope B becomes the live "sidebar"

late unregisterScope(A)
    ↓
manager resolves the "sidebar" entry
    ↓
A could mutate B's live entry
```

Duplicate simultaneously live scopes are already rejected during registration, so this is primarily defensive lifecycle hardening.

Recommended eventual behavior:

```text
duplicate live registration
→ assert

missing unregister
→ warning + no-op

stale instance unregister
→ warning + no-op

exact live instance unregister
→ normal cleanup
```

This should remain a small manager-side guard rather than becoming a scope-topology redesign.

---

## `markForNavigation` attachment lifecycle

The current attachment writes authoring metadata when attached:

```ts
element.setAttribute(NAVIGATION_TARGET_ATTRIBUTE, '');

if (id !== undefined) {
	element.setAttribute(NAVIGATION_TARGET_ID_ATTRIBUTE, id);
}
```

There is currently no corresponding update or cleanup behavior.

This creates possible edge cases if attachment configuration becomes dynamic.

For example, an element that previously received:

```svelte
{@attach markForNavigation(record.id)}
```

and is later reconfigured without an explicit ID could retain the old:

```text
data-navigation-target-id
```

Similarly, dynamically removing the attachment from a surviving DOM element needs well-defined removal semantics for:

```text
data-navigation-target
data-navigation-target-id
```

This is low priority while `markForNavigation` is treated as initialization-time authoring.

If dynamic attachment configuration becomes a supported use case, the attachment should explicitly own attribute update and teardown behavior.

---

# Svelte adapter cleanup

## Canonical component names

The infrastructure currently contains both naming variants:

```text
KeyboardNavigationScope
NavigationScope
```

The intended public vocabulary should remain:

```text
KeyboardNavigationManager
NavigationScope
```

Obsolete duplicate components/files should eventually be removed so public imports, filenames, documentation, and source terminology all agree.

---

## Initialization-time configuration

`NavigationScope.svelte` captures its configuration when its `NavigationScopeInfraImpl` is created:

```text
scopeId
scopeOrder
navigationKeys
discoveryMode
escapeMode
refreshOptions
```

The current API should therefore be considered initialization-time rather than reactive.

This is acceptable and is documented as such.

If reactive reconfiguration is ever required, it should be designed deliberately rather than partially adding `$effect` updates to individual options.

Changes such as:

```text
discoveryMode change
navigationKeys change
scopeId change
scopeOrder change
```

have different lifecycle consequences and should not automatically be treated as equivalent reactive props.

---

# Manager navigation API naming

The manager currently has two distinct navigation concepts:

```text
direct scope switching
→ T / Shift+T by default
→ assignScopeNavigationKeys()

directional edge handoff
→ NavigationManager NavigationKeysConfig
→ ArrowDown / ArrowUp by default
```

The behavior is intentionally separate, but the API vocabulary can be confusing.

In particular:

```text
navigationKeyConfig
assignScopeNavigationKeys()
```

sound more similar than the behaviors they configure actually are.

A future API cleanup could establish clearer terminology such as:

```text
scopeSwitchKeys
edgeNavigationKeys
```

or equivalent names.

Do not rename these solely for aesthetics while the infrastructure is internal, but revisit the terminology before exposing it as a stable external package API.

---

# Engine coupling

## Hotkey integration

`NavigationManager` directly owns registration with the engine hotkey system.

Conceptually:

```text
NavigationManager
    ↓
hotKeysModule
```

This keeps the current implementation simple but couples:

```text
navigation behavior
+
hotkey transport
```

A standalone navigation package might instead depend on an injected keyboard/input adapter.

Do not introduce that abstraction until standalone extraction is actually needed.

---

## Focus integration

Keyboard navigation currently focuses through engine-specific focus helpers.

The focus path also performs behavior beyond topology:

```text
set keyboard-navigation mode
focus node
prevent default focus scrolling
scroll target into view
select text inputs
```

These responsibilities may eventually need to separate into:

```text
target resolution
focus movement
navigation-mode state
input editing behavior
```

This becomes particularly relevant if explicit focus / activate / deactivate semantics are introduced.

---

## Assertions and shared infrastructure

The core also depends on application infrastructure including:

```text
engineAssert
MapList / PriorityMapList
OneToManyDictionary
shared hotkey types
```

Some of these collections may remain useful dependencies if the infrastructure is extracted internally.

For a truly standalone package, these dependencies would need either:

```text
replacement
dependency inversion
or relocation into shared package infrastructure
```

Do not abstract them merely for theoretical portability.

---

# Debugging and diagnostics

The implementation currently contains development-oriented diagnostics such as:

```text
console.debug
console.log
console.warn

data-debug-navigation-index
data-navigation-target-id-resolved
```

Before treating the infrastructure as polished library code, review:

```text
which logs should remain
which logs should be conditional/debug-only
which DOM attributes are public authoring contracts
which DOM attributes are internal runtime metadata
```

The intended distinction is approximately:

```text
data-navigation-target
data-navigation-target-id
→ authored navigation metadata

data-navigation-target-id-resolved
data-debug-navigation-index
→ internal/runtime/debug metadata
```

The latter should not become accidental public API unless a concrete debugging feature requires it.

---

# Assertion consistency

The infrastructure currently asserts configuration/invariant violations including:

```text
nested scopes
nested marked targets
duplicate live scope IDs
duplicate live target IDs
empty explicit target IDs
reserved automatic-ID prefix usage
```

These are appropriate application/developer errors.

A future consistency audit should maintain a clear distinction:

```text
invalid authoring or impossible invariant
→ assert

unexpected but recoverable lifecycle state
→ warning + defensive no-op

ordinary runtime absence
→ undefined / false
```

This should be reviewed across the infrastructure in one focused pass rather than changed incrementally without a consistent policy.

---

# Scope ordering

Current scope ordering supports:

```text
initial scopeOrder
+
stable logical position across remounts
```

Once a logical `scopeId` has established its place in manager topology, remounting that scope preserves the remembered position.

Not currently supported:

```text
reactive scopeOrder
dynamic live reordering
priority updates
```

This is intentional.

Add a dynamic ordering API only when there is a concrete use case.

---

# Target identity API

Target identity is intentionally minimal:

```ts
type NavigationTargetId = string;
```

Stable application identity is authored directly:

```svelte
{@attach markForNavigation(record.id)}
```

Possible conveniences could later derive identity from things such as:

```text
record helpers
route identity
href
component-specific domain IDs
```

These should not be added until explicit IDs prove repeatedly inconvenient.

Application-owned IDs are currently clearer and avoid implicit identity rules.

---

# Accessibility interaction semantics

The current infrastructure answers:

```text
which navigation target is current?
where should directional navigation move?
which DOM node should receive focus?
```

It does not yet model richer interaction states:

```text
focus
activate
deactivate
edit
```

This matters particularly for controls such as text inputs.

A future interaction model may look like:

```text
navigate to input wrapper
    ↓
navigation target selected

Enter
    ↓
activate
    ↓
focus/edit actual input

Escape
    ↓
deactivate
    ↓
return to navigation mode
```

This should be designed as a separate interaction/accessibility layer.

It should not be embedded into target discovery or scope traversal.

---

# Public introspection

Current introspection is intentionally limited through internal `_debugInfo()` APIs.

Possible future debugging needs include:

```text
current scope
scope order
live/unmounted scope state
current target
target count
restoration state
refresh count
discovered targets
```

Do not expose internal `MapList` / `PriorityMapList` instances as the public debugging API.

If richer introspection becomes useful, expose explicit read-only snapshots instead.

---

# Known design constraints

These are intentional constraints, not current technical debt:

```text
NavigationScope instances cannot be nested.

Marked navigation targets cannot be nested.

Live scopes require unique scopeId values.

Live targets inside a scope require unique target IDs.

Automatic target IDs do not preserve logical identity
across complete DOM recreation.

scopeOrder establishes initial logical ordering;
it is not reactive.

Scope options are initialization-time configuration.

Browser focus takes precedence over remembered
restoration state.

Direct scope-switch keys and directional edge-handoff
keys are separate manager concerns.
```

Changing any of these should be treated as an architecture/API decision rather than routine cleanup.

---

# Priority

Current recommendation:

```text
No immediate implementation work required.
```

Address these items when they become relevant to:

```text
a demonstrated lifecycle bug
a real application requirement
standalone package extraction
accessibility interaction work
or production diagnostics
```

Avoid expanding the infrastructure solely to resolve hypothetical future needs.