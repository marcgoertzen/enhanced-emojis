# Enhanced Emojis

Enhanced Emojis is a Mattermost WebApp plugin that will improve the display of custom and standard emojis.

This repository is intentionally set up as a WebApp-only plugin foundation. No plugin features are implemented yet, and there is no server-side plugin code.

## Current Scope

- WebApp plugin scaffold
- Plugin manifest for `de.dakosy.enhanced-emojis`
- Minimal build and test setup

## Development

The primary workflow is now Node-based and does not depend on Go helper binaries.

Useful root commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build:webapp
npm run package
npm run verify
```

The root `Makefile` is now only a thin compatibility wrapper around the same npm commands:

```bash
make webapp
make dist
make verify
```

If you only want to work on the WebApp package directly:

```bash
cd webapp
npm run lint
npm run check-types
npm run build
```

## Packaging

`npm run package` builds the WebApp and creates a Mattermost plugin archive at:

```bash
dist/de.dakosy.enhanced-emojis.tar.gz
```

The package contains:

- `plugin.json`
- `webapp/dist/main.js`
- `assets/` when present
- `public/` when present

## Legacy Tooling

The repository still contains Mattermost starter-template Go build files under `build/` as well as `go.mod`, `go.sum`, and `.golangci.yml`.

These files are retained temporarily during the migration, but they are no longer part of the primary build and packaging workflow.

## Future Work

Planned work for later steps includes:

- emoji display improvements in posts
- reaction rendering improvements
- emoji picker styling
- optional plugin configuration
