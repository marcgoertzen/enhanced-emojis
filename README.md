# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin that improves custom and standard emoji rendering in posts and reactions.

Current release: `v0.4.2`.

## Features

- Larger custom emojis in post content
- Admin-controlled enlargement of standard Mattermost emojis in posts and reactions
- Separate sizing for standalone and inline post emojis
- Larger custom and standard emoji reactions with size-aware chip layout
- User-level opt-in with saved size preferences
- Admin-controlled custom/standard post, reaction, and developer-mode availability
- WebApp user settings localized to English and German
- Build identity metadata for runtime and cache verification

## Compatibility

- Mattermost plugin ID: `io.github.marcgoertzen.enhanced-emojis`
- Minimum server version: `10.0.0`
- Package archive: `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz`

## Admin Settings

The plugin exposes four emoji feature gates and one developer setting:

- `Enable Custom Post Emojis`
- `Enable Custom Reaction Emojis`
- `Enable Standard Post Emojis`
- `Enable Standard Reaction Emojis`
- `Enable Developer Mode`

Post gates include both standalone and inline post emojis. User size preferences remain hidden while their corresponding
admin feature gate is disabled, but saved values are retained.

Existing installations retain the legacy `Enable Enhanced Post Emojis` and `Enable Enhanced Reaction Emojis` values as
fallbacks until explicit custom/standard gates are configured.

`Enable Developer Mode` enables debug logging and developer-facing build information. Debug logs appear only while this
admin setting is enabled.

## User Settings

The plugin adds an `Enhanced Emojis` section in user settings with:

- `Enable Enhanced Emojis`
- Separate standard and custom post, inline post, and reaction size preferences

Behavior:

- The plugin is disabled by default for every user.
- Users must explicitly enable `Enable Enhanced Emojis` before any visual changes apply.
- User preferences never override admin-disabled features.
- Hidden preferences remain stored and apply again when the related feature becomes available.
- Preferences are stored in the Mattermost preference category `enhanced_emojis`.

Post sizing:

- Standard and custom post size preferences apply to their matching emoji type for standalone or emoji-only posts.
- Standard and custom inline post size preferences apply to their matching emoji type inside normal post text.
- Inline post emojis default to normal text size so they stay readable inside sentences.

Visibility:

- The master switch is always visible.
- Each standard/custom post and inline size setting is shown only when the user enabled the plugin and its matching
  admin post feature is enabled.
- Each standard/custom reaction size setting is shown only when the user enabled the plugin and its matching admin
  reaction feature is enabled.
- If the user has not enabled the plugin, the size settings stay hidden and the UI shows
  `Enable Enhanced Emojis to customize your emoji appearance.`
- If all admin emoji features are disabled, the UI shows
  `No Enhanced Emojis features are currently enabled by your administrator.`

Presets:

- Post emojis: `Default` = `32px`, `Large` = `48px`, `Extra Large` = `64px`, `Max` = `128px`
- Inline post emojis: `Default` = `20px`, `Medium` = `32px`, `Large` = `48px`, `Extra Large` = `64px`, `Max` = `128px`
- Reaction emojis: `Default` = `20px`, `Medium` = `32px`, `Large` = `64px`, `Max` = `128px`

## Developer Mode

When `Enable Developer Mode` is enabled by an administrator, the plugin:

- emits debug logs in the browser console
- shows a `Debug Build Info` block in the plugin user settings
- logs runtime identity data including plugin version, build timestamp, build ID, git commit, bundle file name, and the
  preference category

Developer Mode does not bypass admin feature flags or the user opt-in toggle.

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
- `server/` for the minimal config endpoint used by the WebApp
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

`webapp/src/build-info.ts` is generated automatically during `typecheck`, `test`, `build:webapp`, `package`, and
`verify`. It contains the build identity used for runtime verification and should not be edited manually.

## Manual Testing

1. Run `npm run package`.
2. Upload `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz`.
3. Enable the plugin and configure the admin feature flags.
4. Enable `Enhanced Emojis` in user settings.
5. Verify standalone custom emoji posts use the custom post size setting.
6. Verify inline custom emoji posts use the custom inline post size setting.
7. Verify standard and custom post sizes follow their corresponding admin gates and user size settings.
8. Verify standard and custom reactions follow their corresponding admin gates and user size settings.
9. Hard reload Mattermost and confirm post and inline emoji sizes still apply without saving settings again.
10. Verify saved preferences are still read from the Mattermost preference category `enhanced_emojis`.
11. If `Enable Developer Mode` is enabled, verify console debug logs and the `Debug Build Info` block are visible.

## Known Limitations

- Standard Unicode emojis are supported when `Enable Standard Post Emojis` or `Enable Standard Reaction Emojis` is enabled.
- The emoji picker is unchanged.
- The plugin depends on the server config endpoint. If configuration cannot be loaded, the WebApp falls back to built-in
  defaults.
- Packaging requires the Go toolchain plus `tar` and `gzip` on the build machine.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflow and development notes.
