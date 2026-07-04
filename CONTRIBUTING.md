# Contributing

## Scope

Enhanced Emojis is primarily a Mattermost WebApp plugin. The repository also includes a minimal Go server component that
exposes plugin configuration to the WebApp. Contributions should stay focused on lightweight UI improvements for emoji
rendering unless a change explicitly requires broader scope.

## Workflow

1. Keep changes small and focused.
2. Prefer CSS over JavaScript when styling alone is sufficient.
3. Do not introduce server-side functionality unless it is explicitly requested.
4. Avoid adding dependencies unless they are clearly necessary.
5. Keep naming and repository metadata consistent with `plugin.json`.

## Project Layout

- `webapp/src/` contains production WebApp code.
- `webapp/tests/` contains test files and Jest setup.
- `server/` contains the minimal plugin backend for configuration delivery.
- `scripts/` contains repository helper scripts.

## Setup

- Use the repository root `package.json` scripts for linting, type-checking, testing, building, packaging, and release
  verification.
- `npm run typecheck`, `npm run test`, `npm run build:webapp`, `npm run package`, and `npm run verify` refresh
  `webapp/src/build-info.ts` automatically.
- Do not manually edit `webapp/src/build-info.ts` unless you are changing the generator in
  `scripts/generate-build-info.js`.
- `npm run package` requires a working Go toolchain plus `tar` and `gzip` on the build machine.

## Verification

Before opening a release-related change, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run verify
```

`npm run verify` runs lint, typecheck, tests, and packaging.

## Developer Mode

- Debug logs are emitted only when the admin setting `Enable Developer Mode` is enabled.
- When Developer Mode is enabled, user settings include a `Debug Build Info` section sourced from generated build
  metadata.

## Release Notes

- Update `CHANGELOG.md` for user-visible changes.
- Keep the plugin name as `Enhanced Emojis`.
- Use semantic versioning.
- Keep release version references aligned with `plugin.json` and `package.json`. The current release is `0.4.0`.
