# Enhanced Emojis

Enhanced Emojis is a Mattermost WebApp plugin for improving the display of custom and standard emojis in Mattermost.

Version `0.1.0` is the first public MVP release. It is intentionally WebApp-only and does not include server-side plugin functionality.

## Current Features

- Larger custom emojis in Mattermost post content
- WebApp-only implementation with CSS-first styling
- Minimal build, test, and packaging workflow

Current non-goals for `v0.1.0`:

- No admin or user settings yet
- No reaction or emoji picker styling yet
- No server-side functionality

## Compatibility

- Mattermost plugin ID: `de.dakosy.enhanced-emojis`
- Minimum server version: `10.0.0`
- Plugin archive output: `dist/de.dakosy.enhanced-emojis.tar.gz`

## Development

The primary workflow is Node-based. The WebApp source lives in `webapp/src/` and automated tests live in `webapp/tests/`.

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

## Local Testing In Mattermost

1. Run `npm run package`.
2. Upload `dist/de.dakosy.enhanced-emojis.tar.gz` in the Mattermost System Console.
3. Enable the plugin.
4. Create or use an existing custom emoji.
5. Post a message containing that custom emoji and confirm it renders larger in post content.

## Repository Structure

- `plugin.json` contains the plugin manifest used for packaging
- `webapp/src/` contains the WebApp implementation
- `webapp/tests/` contains Jest setup and WebApp tests
- `assets/` contains plugin assets
- `scripts/` contains repository build and packaging helpers

## Legacy Tooling

The repository still contains Mattermost starter-template Go build files under `build/` as well as `go.mod`, `go.sum`, and `.golangci.yml`.

These files are retained temporarily during the migration, but they are no longer part of the primary build and packaging workflow.

## Future Work

Planned work for later steps includes:

- Unicode emoji improvements in posts
- reaction rendering improvements
- emoji picker styling
- optional plugin configuration

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development notes and the expected contribution workflow.
