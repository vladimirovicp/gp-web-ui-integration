# AGENTS.md

## What this repo is

A FreeIPA web UI plugin for Group Policy management. Not a standalone app — it loads inside FreeIPA's existing web UI via its AMD/RequireJS plugin system. The branch tracks version `32.spa-adaptive`.

## Architecture

```
chain/                  # Entire plugin
├── chain.js            # Registers "chain" entity (search/details/association facets) + actions (enable/disable/reorder)
├── gpo.js              # Registers "gpo" entity + opens the GPUI editor modal; dynamically injects CSS
├── css/                # Stylesheets loaded by gpo.js at runtime
├── img/                # SVG assets
└── js/                 # Embedded SPA (opens in a Bootstrap modal from the GPO search facet)
    ├── app.js          # Entry point: init() → locale sync → renders header/tree/workspace/footer
    ├── components/     # UI components (header, main, footer, workspace, tree-view, templates)
    ├── util/
    │   ├── API.js      # All FreeIPA RPC calls (gpo.show, gpo.get_policy, gpo.set_policy, gpo.get_locale, etc.)
    │   ├── element-creator.js  # DOM helper
    │   └── safe-storage.js / shortcuts  # localStorage wrappers
    └── locales/        # en.js, ru.js translations; translations.js manages language switching
```

- Two FreeIPA entities: `chain` (policy chains with usergroup/computergroup) and `gpo` (Group Policy Objects).
- The GPUI modal (`gpo.js` → `gpui_action`) loads `chain/js/app.js` via `require(['./js/app'])` and renders a policy tree editor inside a Bootstrap modal.
- `app.js` `init()` is async (promise chain) but returns `{ container }` synchronously.
- Template system: tree items are rendered by template type — `admx`, `scripts`, `preferences` (with sub-types: shortcuts, environment, folders, registry, driveMaps, networkShares, files, iniFiles), `folder`, `default`.

## Key conventions and gotchas

- **AMD modules only.** All files use `define([deps], function(...) {})`. No ES modules, no bundler, no `node_modules`, no build step — files are served as-is by FreeIPA's web server.
- **FreeIPA returns single values as arrays.** `API.js:normalizeSingleString()` unwraps them. When consuming RPC results, always check `data.result.result`.
- **CSS is injected by JS.** `gpo.js` creates `<link>` elements for `css/main.css` and `css/other.css`. Do not add CSS links to HTML.
- **Locale sync on init.** `app.js` reads `navigator.language`, maps it (`ru` → `ru-RU`, default → `en-US`), then calls `gpo.set_locale` RPC if it differs from server locale. The UI does not render until this promise chain completes.
- **Policy name is cached.** `API.initNameGpt(policyName)` caches `_policyName` and fetches `gpcfilesyspath` via `gpo.show`. Other modules must use `API.waitForNameGpt()` (async) or `API.getNameGpt()` (sync, may be null).
- **No tests, no linter, no type checker.** No CI config exists. Verification is manual against a running FreeIPA instance.
- **`project/` is gitignored.** It likely contains the FreeIPA source this plugin integrates into for local development.
- **Documentation is in Russian.** `doc/` contains process notes and planning docs (mostly Russian).
- **XSS prevention:** Modal title in `gpo.js` uses jQuery `.text()`, not string concatenation into HTML.

## RPC commands used

| Method | Entity | Purpose |
|--------|--------|---------|
| `show` | `gpo` | Get GPO data (gpcfilesyspath) |
| `get_policy` | `gpo` | Load policy tree (ADMX definitions) |
| `set_policy` | `gpo` | Save policy value |
| `delete_policy` | `gpo` | Remove policy value |
| `get_current_value` | `gpo` | Read current policy state |
| `get_locale` / `set_locale` | `gpo` | Server-side locale management |
| `enable` / `disable` | `chain` | Toggle chain active state |
| `mod` | `chain` | Reorder GPCs within chain (`moveup_gpc`, `movedown_gpc`) |
| `mod` | `gpmaster` | Reorder chains (`moveup_chain`, `movedown_chain`) |
| `add_gpo` / `remove_gpo` | `chain` | Manage chain↔GPO associations |
