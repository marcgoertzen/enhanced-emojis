# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin that improves custom emoji rendering in posts and reactions.

Current release: `v0.4.0`.

## Features

- Larger custom emojis in post content
- Separate sizing for standalone and inline post emojis
- Larger custom emoji reactions with size-aware chip layout
- User-level opt-in with saved size preferences
- Admin-controlled post, reaction, and developer-mode availability
- WebApp user settings localized to English and German

## Compatibility

- Mattermost plugin ID: `io.github.marcgoertzen.enhanced-emojis`
- Minimum server version: `10.0.0`
- Package archive: `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz`

## Admin Settings

The plugin exposes three admin settings:

- `Enable Enhanced Post Emojis`
- `Enable Enhanced Reaction Emojis`
- `Enable Developer Mode`

`Enable Enhanced Post Emojis` controls post custom emojis only.

`Enable Enhanced Reaction Emojis` controls custom emoji reactions only.

`Enable Developer Mode` enables visual debug styling for whichever admin-enabled feature is active for the user.

## User Settings

The plugin adds an `Enhanced Emojis` section in user settings with:

- `Enable Enhanced Emojis`
- `Post Emoji Size`
- `Inline Post Emoji Size`
- `Reaction Emoji Size`

Behavior:

- The plugin is disabled by default for every user.
- Users must explicitly enable `Enable Enhanced Emojis` before any visual changes apply.
- User preferences never override admin-disabled features.
- Hidden preferences remain stored and apply again when the related feature becomes available.

Post sizing:

- `Post Emoji Size` applies to standalone or emoji-only custom emoji posts.
- `Inline Post Emoji Size` applies to custom emojis inside normal post text.
- Inline post emojis default to normal text size so they stay readable inside sentences.

Visibility:

- The master switch is always visible.
- `Post Emoji Size` and `Inline Post Emoji Size` are shown only when the user enabled the plugin and the admin post feature is enabled.
- `Reaction Emoji Size` is shown only when the user enabled the plugin and the admin reaction feature is enabled.
- If the user has not enabled the plugin, the size settings stay hidden and the UI shows `Enable Enhanced Emojis to customize your emoji appearance.`
- If both admin features are disabled, the UI shows `No Enhanced Emojis features are currently enabled by your administrator.`

Presets:

- Post emojis: `Default` = `32px`, `Large` = `48px`, `Extra Large` = `64px`, `Max` = `128px`
- Inline post emojis: `Default` = `20px`, `Medium` = `32px`, `Large` = `48px`, `Extra Large` = `64px`, `Max` = `128px`
- Reaction emojis: `Default` = `20px`, `Medium` = `32px`, `Large` = `64px`, `Max` = `128px`

## Localization

The WebApp user settings follow the current Mattermost user language.

Supported languages:

- English
- German

Locale behavior:

- `de` and `de-*` use German
- `en` and `en-*` use English
- all other locales fall back to English

Admin settings in `plugin.json` remain English-only.

## Installation

1. Run `npm run package`.
2. Upload `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz` in the Mattermost System Console.
3. Enable the plugin.

## Development

Source layout:

- `plugin.json` for plugin metadata
- `webapp/src/` for the WebApp implementation
- `webapp/tests/` for Jest tests
- `server/` for the minimal config endpoint
- `scripts/` for build and packaging helpers

Useful commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build:webapp
npm run package
npm run verify
```

## Build And Package

`npm run package` builds the WebApp, builds the server executables, and creates:

```bash
dist/io.github.marcgoertzen.enhanced-emojis.tar.gz
```

## Manual Testing

1. Run `npm run package`.
2. Upload `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz`.
3. Enable the plugin and configure the admin feature flags.
4. Enable `Enhanced Emojis` in user settings.
5. Verify standalone custom emoji posts use `Post Emoji Size`.
6. Verify inline custom emoji posts use `Inline Post Emoji Size`.
7. Verify reactions use `Reaction Emoji Size` only when the reaction feature is enabled.
8. Hard reload Mattermost and confirm post and inline emoji sizes still apply without saving settings again.

## Known Limitations

- Unicode emojis are unchanged.
- The emoji picker is unchanged.
- Developer Mode is intended for visual debugging and should stay disabled in normal use.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflow and development notes.
