# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and the project uses Semantic Versioning.

## [Unreleased]

### Added

- User-level size preferences for custom emojis in posts and reactions.

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
