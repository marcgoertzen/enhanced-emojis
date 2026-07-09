# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and the project uses Semantic Versioning.

## [0.4.1]

### Added
- Added contextual help messages for the user settings depending on whether Enhanced Emojis is enabled or disabled.

### Fixed
- Fixed post and inline post emoji sizing after channel navigation.
- Fixed post emoji classification after client-side rerendering.

### Changed
- Updated the user settings toggle to use theme-aware styling and centralized CSS.

## [0.4.0]

### Added

- Context-aware post emoji sizing.
- Separate Inline Post Emoji setting.
- User-level plugin enable/disable.
- German and English localization.
- Build identity metadata in `webapp/src/build-info.ts` for runtime and cache verification.
- Developer Mode build information in user settings.

### Changed

- Refactored WebApp architecture into lifecycle, config, features, and settings modules.
- Improved post/reaction feature separation.
- Improved project structure and maintainability.
- Removed DAKOSY-specific branding.
- Renamed plugin identifier to a generic identifier.
- `Enable Enhanced Reaction Emojis` is now enabled by default.

### Fixed

- Fixed post emoji initialization after page reload.
- Fixed persistence and restore behavior for user settings stored in the Mattermost preference category
  `enhanced_emojis`.
- Fixed Developer Mode so debug logs are emitted only while the admin setting is enabled.
- Improved post emoji classification lifecycle.
- Various internal cleanup and stability improvements.

## [0.3.0]

### Added

- Added user-specific emoji size preferences.
- Added separate size presets for post emojis and reaction emojis.

### Changed

- Removed admin-controlled emoji size settings.
- Admins now control feature availability, while users control personal emoji sizes.
- Updated reaction emoji size presets.
- Improved reaction chip layout across different emoji sizes.
- Updated documentation for admin settings and user preferences.

## [0.2.0] - 2026-06-30

### Added

- Added custom emoji reaction support.
- Added configurable emoji sizes.
- Added reliable server-backed admin configuration.
- Added Developer Mode.
- Added reaction-specific setting.
- Improved package/build workflow.

### Fixed

- Fixed Linux server executable permissions in the package.
- Fixed custom emoji reaction selector handling.

## [0.1.0] - 2026-06-30

### Added

- First public WebApp-only MVP release of Enhanced Emojis.
- Minimal server component for reliable plugin configuration.
- CSS-first custom emoji enlargement for Mattermost post content.
- Admin settings for enabling the plugin, developer mode, reaction emojis, and configurable emoji size.
- Emoji size now includes a `Max Size` option at `128px`.
- Node-based lint, typecheck, test, build, and packaging workflow.
- Basic release metadata and contributor documentation.
