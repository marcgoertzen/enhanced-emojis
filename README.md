# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin for improving the display of custom emojis in post content.

Version `0.3.0` is the current release. It uses a minimal server component only to expose plugin configuration reliably to the WebApp.

## Current Features

- Larger custom emojis in Mattermost post content
- Custom emoji reactions with size-aware chip layout
- CSS-first WebApp styling
- Reliable admin configuration through a minimal server endpoint
- User-level size preferences for post and reaction emojis
- Node-based build, test, and packaging workflow

Current non-goals for `v0.3.0`:

- No reaction or emoji picker styling yet
- No Unicode emoji styling yet

## Compatibility

- Mattermost plugin ID: `de.dakosy.enhanced-emojis`
- Minimum server version: `10.0.0`
- Plugin archive output: `dist/de.dakosy.enhanced-emojis.tar.gz`

## Configuration

The plugin exposes three admin settings:

- `Enable Enhanced Emojis`
- `Enable Reaction Emojis`
- `Enable Developer Mode`

Administrators decide which features are available in Mattermost.

`Enable Enhanced Emojis` controls custom emoji sizing in post content only.

`Enable Reaction Emojis` controls custom emoji sizing in reactions only.

`Enable Developer Mode` overrides the size for whichever enabled feature is active to `64px` and enables the red outline used for visual debugging.

## User Settings

The plugin adds a user settings section called `Enhanced Emojis` with:

- `Post Emoji Size`
- `Reaction Emoji Size`

Both default to `Default (32px)` for posts and `Default (20px)` for reactions, and only affect the corresponding feature when the admin has enabled it.

The user settings UI only shows sections for features that the administrator has enabled:

- `Enable Enhanced Emojis` on: show `Post Emoji Size`
- `Enable Enhanced Emojis` off: hide `Post Emoji Size`
- `Enable Reaction Emojis` on: show `Reaction Emoji Size`
- `Enable Reaction Emojis` off: hide `Reaction Emoji Size`

If both features are disabled, the settings UI shows a short informational message instead of empty sections.

Post emoji presets:

- `Default` = `32px`
- `Large` = `48px`
- `Extra Large` = `64px`
- `Max` = `128px`

Reaction emoji presets:

- `Default` = `20px`
- `Medium` = `32px`
- `Large` = `64px`
- `Max` = `128px`

User settings never enable a feature on their own. Hidden preferences remain stored and will apply again if the administrator later re-enables the feature.

Current release: `v0.3.0`.

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
3. Configure `Enable Enhanced Emojis`, `Enable Reaction Emojis`, and `Enable Developer Mode` as needed.
4. Enable the plugin.
5. Open your user settings and confirm that only the sections for enabled admin features are visible.
6. Set `Post Emoji Size` and `Reaction Emoji Size` only for the visible sections.
7. Create or use an existing custom emoji.
8. Post a message containing that custom emoji and confirm it renders larger only when `Enable Enhanced Emojis` is enabled.
9. Add the same custom emoji as a reaction and confirm it renders larger only when `Enable Reaction Emojis` is enabled.
10. Turn on Developer Mode to verify the 64px debug size and red outline for whichever feature is enabled.

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

- Custom emojis in post content are enlarged only when `Enable Enhanced Emojis` is enabled.
- Custom emoji reactions are enlarged only when `Enable Reaction Emojis` is enabled and use a size-aware chip layout.
- Unicode emojis are unchanged.
- The emoji picker is unchanged.
- Developer Mode is intended for visual debugging and should stay disabled in normal use.
- User preferences only affect size, not whether a feature is enabled.

## Future Work

Planned work for later steps includes:

- Unicode emoji improvements in posts
- reaction rendering improvements
- emoji picker styling
- optional plugin configuration

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development notes and the expected contribution workflow.
