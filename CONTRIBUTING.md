# Contributing

## Scope

Enhanced Emojis is currently a Mattermost WebApp-only plugin. Contributions should stay focused on lightweight UI improvements for emoji rendering unless a change explicitly requires broader scope.

## Workflow

1. Keep changes small and focused.
2. Prefer CSS over JavaScript when styling alone is sufficient.
3. Do not introduce server-side functionality unless it is explicitly requested.
4. Avoid adding dependencies unless they are clearly necessary.
5. Keep naming and repository metadata consistent with `plugin.json`.

## Project Layout

- `webapp/src/` contains production WebApp code.
- `webapp/tests/` contains test files and Jest setup.
- `scripts/` contains repository helper scripts.

## Verification

Before opening a release-related change, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build:webapp
npm run package
```

## Release Notes

- Update `CHANGELOG.md` for user-visible changes.
- Keep the plugin name as `Enhanced Emojis`.
- Use semantic versioning. For the first public MVP release, `0.1.0` is the correct version.
