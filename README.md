# Enhanced Emojis

Enhanced Emojis is a Mattermost plugin that improves custom and standard emoji rendering in posts and reactions.

## Features

- Larger custom and standard Mattermost emojis in post content and reactions
- Separate sizing for standalone and inline post emojis
- Larger custom and standard emoji reactions with size-aware chip layout
- Per-user enable/disable setting with six independent size preferences for custom and standard emojis
- Admin-controlled custom/standard post, reaction, and developer-mode availability
- WebApp user settings localized to English and German

## Compatibility

- Minimum server version: `10.0.0`
- Plugin ID: `io.github.marcgoertzen.enhanced-emojis`
- Release package: `io.github.marcgoertzen.enhanced-emojis.tar.gz`

## Installation

1. Download the latest `io.github.marcgoertzen.enhanced-emojis.tar.gz` from the project's [GitHub Releases](https://github.com/marcgoertzen/enhanced-emojis/releases).
2. In Mattermost, open **System Console** and go to **Plugin Management**.
3. Upload the `.tar.gz` plugin package.
4. Enable **Enhanced Emojis**.
5. Open the Enhanced Emojis plugin configuration.
6. Choose which custom and standard post and reaction features are available.

> [!NOTE]
> Plugin uploads must be enabled on the Mattermost server. If the upload option is unavailable, contact your Mattermost administrator.

Users configure their personal emoji sizes under **Settings → Enhanced Emojis**.

## Administrator Configuration

The plugin exposes four emoji feature gates and one developer setting:

- `Enable Custom Post Emojis`
- `Enable Custom Reaction Emojis`
- `Enable Standard Post Emojis`
- `Enable Standard Reaction Emojis`
- `Enable Developer Mode`

Post gates include both standalone and inline post emojis. User size preferences remain hidden while their corresponding
admin feature gate is disabled, but saved values are retained.

`Enable Developer Mode` enables debug logging, developer-facing build information, and visual emoji highlighting. Debug
logs appear only while this admin setting is enabled.

## User Configuration

After an administrator enables the relevant features, users open **Settings → Enhanced Emojis** and can configure:

- `Enable Enhanced Emojis`
- `Standard Emoji Post Size`
- `Standard Emoji Inline Post Size`
- `Standard Emoji Reaction Size`
- `Custom Emoji Post Size`
- `Custom Emoji Inline Post Size`
- `Custom Emoji Reaction Size`

Behavior:

- The plugin is disabled by default for every user.
- Users must explicitly enable `Enable Enhanced Emojis` before any visual changes apply.
- User preferences never override admin-disabled features.
- Hidden preferences remain stored and apply again when the related feature becomes available.

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

## Upgrading from v0.4.x

Version `0.5.0` adds support for standard Mattermost emojis and separates custom and standard emoji sizing. Existing
shared `postEmojiSize`, `inlinePostEmojiSize`, and `reactionEmojiSize` preferences continue to initialize both emoji
types until separate values are saved. Existing `Enable Enhanced Post Emojis` and `Enable Enhanced Reaction Emojis`
administrator values are used as fallbacks for the corresponding custom and standard gates until the new explicit gates
are configured. Existing users must still enable the `Enhanced Emojis` master setting for visual changes to apply.

## Developer Mode

When `Enable Developer Mode` is enabled by an administrator, the plugin:

- emits debug logs in the browser console
- shows a `Debug Build Info` block in the plugin user settings
- logs runtime identity data including plugin version, build timestamp, build ID, git commit, bundle file name, and the
  preference category
- outlines recognized custom and standard post, inline, and reaction emojis for visual debugging

Developer Mode does not bypass admin feature flags or the user opt-in toggle.
It also does not override the user's configured emoji sizes.

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

## Development

Clone the repository when developing or testing unreleased changes. Normal users should install the released package
from GitHub Releases instead.

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

`npm run package` builds the WebApp, builds the server executables, and creates:

```bash
dist/io.github.marcgoertzen.enhanced-emojis.tar.gz
```

`webapp/src/build-info.ts` is generated automatically during `typecheck`, `test`, `build:webapp`, `package`, and
`verify`. It contains the build identity used for runtime verification and should not be edited manually.

Packaging requires the Go toolchain plus `tar` and `gzip` on the build machine.

### Manual Testing

1. Run `npm run package`.
2. Upload `dist/io.github.marcgoertzen.enhanced-emojis.tar.gz`.
3. Enable the plugin and configure the admin feature flags.
4. Enable `Enhanced Emojis` in user settings.
5. Verify standalone custom emoji posts use the custom post size setting.
6. Verify inline custom emoji posts use the custom inline post size setting.
7. Verify standard and custom post sizes follow their corresponding admin gates and user size settings.
8. Verify standard and custom reactions follow their corresponding admin gates and user size settings.
9. Hard reload Mattermost and confirm post and inline emoji sizes still apply without saving settings again.
10. If `Enable Developer Mode` is enabled, verify console debug logs and the `Debug Build Info` block are visible.

## Known Limitations

- The emoji picker is unchanged.
- The plugin depends on the server config endpoint. If configuration cannot be loaded, the WebApp falls back to built-in
  defaults.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflow and development notes.
