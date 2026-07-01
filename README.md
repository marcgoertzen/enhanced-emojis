# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin for improving the display of custom emojis in post content.

Version `0.3.0` is the current release. It uses a minimal server component only to expose plugin configuration reliably to the WebApp.

## Current Features

- Larger custom emojis in Mattermost post content
- Custom emoji reactions with size-aware chip layout
- CSS-first WebApp styling
- Reliable admin configuration through a minimal server endpoint
- User-level opt-in plus size preferences for post and reaction emojis
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

- `Enable Enhanced Post Emojis`
- `Enable Enhanced Reaction Emojis`
- `Enable Developer Mode`

Administrators decide which features are available in Mattermost.

`Enable Enhanced Post Emojis` controls custom emoji sizing in post content only.

`Enable Enhanced Reaction Emojis` controls custom emoji sizing in reactions only.

`Enable Developer Mode` overrides the size for whichever enabled feature is active to `64px` and enables the red outline used for visual debugging.

## User Settings

The plugin adds a user settings section called `Enhanced Emojis` with:

- `Enable Enhanced Emojis`
- `Post Emoji Size`
- `Inline Post Emoji Size`
- `Reaction Emoji Size`

The plugin is disabled by default for every user. After installation or update, nothing changes visually until each user explicitly enables `Enable Enhanced Emojis` for their own account.

Administrators control which features are available:

- `Enable Enhanced Post Emojis`
- `Enable Enhanced Reaction Emojis`
- `Enable Developer Mode`

Users control whether the plugin is active for their account and, if active, which size presets should apply.

`Enable Enhanced Emojis` is stored as a normal user preference and defaults to off.

When the user leaves the plugin disabled:

- no enhanced post emojis are applied
- no enhanced reaction emojis are applied
- saved size preferences remain stored and are ignored

When the user enables the plugin, the stored size preferences apply immediately again for whichever admin-enabled features are available.

The size presets default to `Default (32px)` for posts and `Default (20px)` for reactions, and only affect the corresponding feature when both the administrator and the user have enabled it.

`Post Emoji Size` applies to standalone or emoji-only custom emoji posts.

`Inline Post Emoji Size` applies to custom emojis that appear inside normal post text.

Inline custom emojis default to normal text size so they stay readable inside sentences.

The user settings UI always shows the master switch at the top.

Below that, feature-specific sections only appear when:

- the user enabled `Enable Enhanced Emojis`
- the corresponding admin feature is enabled

Visibility rules:

- `Enable Enhanced Post Emojis` on: show `Post Emoji Size`
- `Enable Enhanced Post Emojis` on: show `Inline Post Emoji Size`
- `Enable Enhanced Post Emojis` off: hide `Post Emoji Size`
- `Enable Enhanced Post Emojis` off: hide `Inline Post Emoji Size`
- `Enable Enhanced Reaction Emojis` on: show `Reaction Emoji Size`
- `Enable Enhanced Reaction Emojis` off: hide `Reaction Emoji Size`

If the user has not enabled the plugin, the size settings stay hidden and the settings UI shows `Enable Enhanced Emojis to customize your emoji appearance.`

If both admin features are disabled, the settings UI shows `No Enhanced Emojis features are currently enabled by your administrator.` and keeps the master switch visible.

Post emoji presets:

- `Default` = `32px`
- `Large` = `48px`
- `Extra Large` = `64px`
- `Max` = `128px`

Inline post emoji presets:

- `Default / normal text size` = `20px`
- `Medium` = `32px`
- `Large` = `48px`
- `Extra Large` = `64px`
- `Max` = `128px`

Reaction emoji presets:

- `Default` = `20px`
- `Medium` = `32px`
- `Large` = `64px`
- `Max` = `128px`

User settings never enable an admin-disabled feature on their own. Hidden preferences remain stored and will apply again if the user re-enables the plugin or if the administrator later re-enables the feature.

## Localization

The WebApp user settings are localized automatically based on the current Mattermost user language.

Supported languages:

- English
- German

Language selection follows the Mattermost UI locale for the current user:

- `de` or any `de-*` locale uses German translations
- `en` or any `en-*` locale uses English translations
- any other locale falls back to English

To add another language later:

1. Add a new translation file under `webapp/src/i18n/`.
2. Register the locale in `webapp/src/i18n/index.ts`.
3. Add tests for the new locale.

The administrator settings in `plugin.json` remain English-only by design so the System Console configuration stays stable and unambiguous.

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
3. Configure `Enable Enhanced Post Emojis`, `Enable Enhanced Reaction Emojis`, and `Enable Developer Mode` as needed.
4. Enable the plugin.
5. Open your user settings and confirm that only the sections for enabled admin features are visible and translated to your current Mattermost language.
6. Leave `Enable Enhanced Emojis` disabled and confirm there is no visual change in posts or reactions.
7. Enable `Enable Enhanced Emojis` and confirm the visible size settings match the enabled admin features.
8. Set `Post Emoji Size`, `Inline Post Emoji Size`, and `Reaction Emoji Size` only for the visible sections.
9. Create or use an existing custom emoji.
10. Post a message containing only a custom emoji such as `:cat:` and confirm it uses `Post Emoji Size`.
11. Post a message containing normal text and a custom emoji such as `Hello :cat:` and confirm it uses `Inline Post Emoji Size`.
12. Post a message containing only multiple custom emojis such as `:cat: :dog:` and confirm they still use `Post Emoji Size`.
13. Add the same custom emoji as a reaction and confirm it renders larger only when both `Enable Enhanced Reaction Emojis` and the user master switch are enabled.
14. Disable `Enable Enhanced Emojis` again and confirm the visual enhancement stops while the saved size preferences remain stored.
15. Turn on Developer Mode to verify the standalone post emoji debug size, inline post emoji debug size, and reaction debug size only when the user master switch is enabled and the corresponding feature is enabled.

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

- Custom emojis in post content are enlarged only when `Enable Enhanced Post Emojis` is enabled.
- Inline custom emojis inside normal post text use `Inline Post Emoji Size`, while emoji-only post content uses `Post Emoji Size`.
- Custom emoji reactions are enlarged only when `Enable Enhanced Reaction Emojis` is enabled and use a size-aware chip layout.
- Unicode emojis are unchanged.
- The emoji picker is unchanged.
- Developer Mode is intended for visual debugging and should stay disabled in normal use.
- User preferences control both opt-in and size, but cannot override admin-disabled features.

## Future Work

Planned work for later steps includes:

- Unicode emoji improvements in posts
- reaction rendering improvements
- emoji picker styling
- optional plugin configuration

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development notes and the expected contribution workflow.
