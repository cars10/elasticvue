# AGENTS.md

Also read `README.md` and the `docs/` folder.

Elasticvue is a Vue 3 + TypeScript + Quasar gui for elasticsearch. It runs fully in the client and talks to the cluster directly, there is no backend.

## Setup

- Development is done in docker, do not rely on a local node installation
- `make dev` starts the dev container (vite on port 5173)
- `make lint` runs prettier, eslint and stylelint with autofix, then `tsc` + `vue-tsc` (`npm run check`)
- `make test` runs unit tests and e2e tests in chromium. Arguments in `TEST` go to playwright, e.g. `make test TEST="tests/e2e/tests/pages/Search.spec.ts --workers=4"`
- `make ci` runs `npm run check`, build, unit tests and e2e tests in all browsers. This is what github actions runs
- Before finishing a task run `make lint` and `make test`

## Project structure

- `src/services/ElasticsearchAdapter.ts`: the only place that builds elasticsearch requests. Add a method here for every new API call, do not call `fetch` from components
- `src/composables/CallElasticsearch.ts`: `useElasticsearchAdapter().callElasticsearch(es => es.someMethod())` is how components call the cluster, it handles loading and error state
- `src/store/clusterSession.ts`: active connection, adapter and `capabilities` of the current cluster
- `src/store/connection.ts`: saved clusters, persisted
- `src/helpers/`: pure functions, no vue or store access where possible. Keep logic here so it can be unit tested
- `src/composables/components/<feature>/`: logic for components in `src/components/<feature>/`. Keep `.vue` files thin
- `src/services/migrations.ts`: runs on startup. Any change to the shape of persisted data (pinia persisted stores, indexeddb in `src/db/`) needs a migration, users upgrade from very old versions
- `src/buildConfig.ts`: build mode specific behaviour
- `src/helpers/json/`: always use `parseJson` and `stringifyJson` for cluster responses and user input. They preserve big integers (ids, longs) that `JSON.parse` would corrupt

## Codestyle

- Always use typescript, never plain javascript
- Code needs to match `eslint.config.mjs`, `.prettierrc`, `.stylelintrc.js`: no semicolons, single quotes, print width 130, no trailing commas, no nested ternaries
- Prefer composition api with `<script setup lang="ts">`
- Use quasar components and the existing shared components in `src/components/shared/` before building new ones
- Use the css variables from `src/assets/stylesheets/theme/variables.css` for colors, never hardcode colors. Everything must look right in light and dark theme
- Where possible to not write custom css - use quasar built-in classes.
- No code comments
- Do not use `·` as separator or em-dashes in ui text or code, use `, ` and `-`

## i18n

- All ui text goes into `src/locales/*.json`, never hardcode text in templates
- Every key must exist in all locales (`en`, `cn`, `fr`, `it`, `jp`, `ko`, `ru`, `tw`), eslint fails otherwise. Add a proper translation for each language
- Keys are `snake_case`, no dynamic keys (`t(variable)` is a lint error), use explicit keys
- Remove keys that are no longer used, eslint reports unused keys

## Distributions

Elasticvue is available through many different distribution channels on multiple platforms:

- Hosted web app on app.elasticvue.com
- Docker image https://hub.docker.com/r/cars10/elasticvue (nginx, can import predefined clusters)
- Desktop app built with [tauri](https://v2.tauri.app/), distributed as AppImage for linux, dmg and homebrew for mac, msi for windows
- Browser extension for chrome, firefox, edge (uses hash routing)
- Custom self hosted setups, also on a subdirectory (`VITE_APP_PUBLIC_PATH`)

Every feature we add or change needs to work on all of these platforms. Do not add something that only works in the desktop app for example.

- Platform differences are handled through `buildConfig` (see the table in `src/buildConfig.ts`)
- Requests go through `fetchMethod` in `src/helpers/fetch.ts`, which uses rust (`reqwest`) in tauri and `window.fetch` everywhere else. Never use `fetch` directly
- Use the existing wrappers for clipboard (`src/helpers/clipboard.ts`), dialogs (`src/helpers/dialogs.ts`) and downloads (`src/composables/Download.ts`), they handle tauri and browser
- Never import tauri apis without a `buildConfig.tauri` check and a browser fallback
- In the web and docker versions requests are subject to CORS. Do not add custom request headers without checking that they work with the documented cors config in `README.md`
- Do not use absolute paths for assets or links, the app can run on a subdirectory or as a browser extension
- Do not add external network calls (cdn, analytics, fonts). Apart from the existing update check elasticvue only talks to the configured cluster

## Elasticsearch version support

Elasticvue needs to support *ALL* versions of elasticsearch (1 to 9) including serverless. For every feature we add or change and every API we call we need to check if it is supported, otherwise the feature should be disabled or show an empty state.

- `src/helpers/capabilities.ts` is the entrypoint. Add a flag to `buildCapabilities` instead of checking versions in components
- Use `session.capabilities` in components and composables, and `meta.available` in `src/router.ts` to hide whole routes
- Response formats differ between versions (e.g. `_cat` columns, mapping types before 7, security paths under `_xpack` before 6.6, `expand_wildcards`). Handle missing or renamed fields defensively
- Serverless elasticsearch does not support many APIs (node stats, index open/close, forcemerge, users, ...), check `capabilities.serverless`
- Treat every field in a cluster response as optional, older versions or limited permissions return less data

We also have to support *ALL* versions of opensearch as a second thought. We will not implement features that only exist in opensearch, but we try to make the existing features of elasticvue work with opensearch clusters. Opensearch versions are mapped to a compatible elasticsearch version in `src/helpers/clusterInfo.ts`.

Everything else that might be partly API compatible with elasticsearch is *NOT* officially supported. Our only goal is that the version and cluster info parsing and the healthcheck work, so users can at least add the cluster. Everything else might or might not work. We assume API compatibility with the latest version of elasticsearch.

## Security

- Credentials (password, api key, aws keys) can be stored in session storage only (`secretStorage: session`). Never log credentials, never put them into urls, exports or error messages
- Destructive actions (delete, close, reroute, ...) must ask for confirmation via `askConfirm`
- Respect `action.destructive_requires_name`, see `capabilities.destructiveRequiresNameDefault`

## Testing

- Always add unit tests (vitest, `tests/unit/`) for helpers and services
- Add e2e tests (playwright, `tests/e2e/`) for full features
- E2E tests check behaviour and data only. No assertions on widths, positions, bounding boxes, colors or style classes. UI-only changes (sizes, colors, spacing) need no e2e test
- E2E tests do not need a real cluster. They mock responses per version in `tests/e2e/mocks/` (`elastic_1` to `elastic_8`, `opensearch`) using `page.route`
- When a feature depends on a capability, test it against the oldest and newest version that is affected, and that it is hidden where it is not supported
- Build mode specific behaviour needs a dev server started with that `VITE_APP_BUILD_MODE`. Playwright starts a second dev server with `VITE_APP_BUILD_MODE=docker` on port 5176, and the `chromium-docker` project in `playwright.config.ts` runs only `PredefinedClusters.spec.ts` against it
