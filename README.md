# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin for improving the display of custom emojis in post content.

Version `0.2.0` is the current release. It uses a minimal server component only to expose plugin configuration reliably to the WebApp.

## Current Features

- Larger custom emojis in Mattermost post content
- CSS-first WebApp styling
- Reliable admin configuration through a minimal server endpoint
- Node-based build, test, and packaging workflow

Current non-goals for `v0.2.0`:

- No user-specific settings yet
- No reaction or emoji picker styling yet
- No Unicode emoji styling yet

## Compatibility

- Mattermost plugin ID: `de.dakosy.enhanced-emojis`
- Minimum server version: `10.0.0`
- Plugin archive output: `dist/de.dakosy.enhanced-emojis.tar.gz`

## Configuration

The plugin currently exposes five admin settings:

- `Enable Enhanced Emojis`
- `Enable Developer Mode`
- `Enable Reaction Emojis`
- `Emoji Size`
- `Reaction Emoji Size`

`Emoji Size` accepts `Small`, `Default`, `Large`, `Extra Large`, and `Max Size`.

Developer Mode overrides the configured emoji size for visual debugging and enables a red outline around targeted custom emojis.

`Enable Reaction Emojis` is off by default and only affects custom emoji reactions under posts.

`Reaction Emoji Size` controls custom emoji reactions independently from post emojis.

Size mapping:

- `Small` = `24px`
- `Default` = `32px`
- `Large` = `48px`
- `Extra Large` = `64px`
- `Max Size` = `128px`

## Installation

1. Run `npm run package`.
2. Upload `dist/de.dakosy.enhanced-emojis.tar.gz` in the Mattermost System Console.
3. Enable the plugin.

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

## Build And Package

`npm run package` builds the WebApp, builds the server executables, and creates a Mattermost plugin archive at:

```bash
dist/de.dakosy.enhanced-emojis.tar.gz
```

The package contains:

- `plugin.json`
- `webapp/dist/main.js`
- `server/dist/enhanced-emojis-linux-amd64`
- `server/dist/enhanced-emojis-darwin-amd64`
- `server/dist/enhanced-emojis-windows-amd64.exe`
- `assets/`

`public/` is not currently used.

## Local Testing In Mattermost

1. Run `npm run package`.
2. Upload `dist/de.dakosy.enhanced-emojis.tar.gz` in the Mattermost System Console.
3. Configure `Enable Enhanced Emojis`, `Enable Developer Mode`, `Emoji Size`, and `Reaction Emoji Size` as needed.
4. Enable the plugin.
5. Create or use an existing custom emoji.
6. Post a message containing that custom emoji and confirm it renders larger in post content.
7. Turn on Developer Mode to verify the 64px debug size and red outline.

## Repository Structure

- `plugin.json` contains the plugin manifest used for packaging
- `webapp/src/` contains the WebApp implementation
- `webapp/tests/` contains Jest setup and WebApp tests
- `assets/` contains plugin assets
- `scripts/` contains repository build and packaging helpers

## Legacy Tooling

The repository still contains Mattermost starter-template Go build files under `build/` as well as `go.mod`, `go.sum`, and `.golangci.yml`.

These files are retained temporarily during the migration, but they are no longer part of the primary build and packaging workflow.

## Known Limitations

- Only custom emojis in post content are enlarged.
- Unicode emojis are unchanged.
- Reactions and the emoji picker are unchanged.
- Developer Mode is intended for visual debugging and should stay disabled in normal use.

## Future Work

Planned work for later steps includes:

- Unicode emoji improvements in posts
- reaction rendering improvements
- emoji picker styling
- optional plugin configuration

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development notes and the expected contribution workflow.
