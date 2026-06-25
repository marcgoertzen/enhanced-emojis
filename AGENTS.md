# AGENTS.md

# Enhanced Emojis

Enhanced Emojis is a Mattermost WebApp plugin that improves the display of custom and standard emojis.

The primary goal is to enhance readability while keeping the implementation lightweight, maintainable, and compatible with future Mattermost releases.

---

# Project Structure

This repository contains a Mattermost plugin.

- `plugin.json` – Mattermost plugin manifest
- `webapp/` – TypeScript implementation of the WebApp plugin
- `webapp/src/` – plugin source code
- `webapp/src/styles.css` – CSS customizations
- `assets/` – plugin assets (icon, images)
- `server/` – optional Go backend (currently unused)

The current implementation targets the WebApp only.

Do not introduce server-side functionality unless explicitly requested.

---

# Project Goals

Current priorities:

1. Improve visibility of custom emojis
2. Improve visibility of standard Unicode emojis
3. Improve emoji reactions
4. Improve emoji picker rendering
5. Add configurable settings
6. Keep compatibility with current Mattermost versions

Always prefer small, incremental improvements.

---

# Programming Principles

## KISS

- Prefer simple solutions.
- Avoid unnecessary abstractions.
- Choose readability over clever implementations.

## DRY

- Avoid duplicate logic.
- Reuse existing helper functions.
- Keep a single source of truth.

## Clean Code

- Small functions
- Meaningful names
- Single responsibility
- Minimize dependencies
- Prefer composition over inheritance

---

# Mattermost Plugin Guidelines

- Prefer WebApp-only solutions.
- Do not introduce Go code unless required.
- Use the Mattermost Plugin API whenever possible.
- Avoid monkey patches.
- Avoid modifying Mattermost internals.
- Keep the plugin lightweight.

---

# TypeScript Guidelines

- Use strict TypeScript.
- Prefer `const` over `let`.
- Avoid `any`.
- Prefer interfaces where appropriate.
- Use explicit return types for exported functions.
- Prefer early returns over nested conditions.
- Keep files focused on a single responsibility.

---

# CSS Guidelines

This plugin is primarily a UI enhancement.

Therefore:

- Prefer CSS over JavaScript whenever possible.
- Only manipulate the DOM if CSS alone is insufficient.
- Keep selectors as specific as necessary.
- Avoid overly complex selectors.
- Minimize usage of `!important`.
- Do not style unrelated Mattermost components.

Group styles by feature.

Example:

- Posts
- Reactions
- Emoji Picker

---

# Feature Development

Implement features independently.

Preferred implementation order:

1. Custom emojis in posts
2. Unicode emojis in posts
3. Emoji reactions
4. Emoji picker
5. User settings
6. Admin settings

Every feature should be functional before starting the next one.

---

# Dependencies

Before adding any dependency:

- Verify that it is actually needed.
- Prefer built-in browser APIs.
- Prefer existing Mattermost APIs.
- Ask before introducing large third-party libraries.

---

# Build & Testing

Before considering a task complete:

- Build the WebApp plugin.
- Fix TypeScript errors.
- Fix ESLint issues.
- Ensure the plugin loads successfully in Mattermost.

Do not ignore compiler warnings without justification.

---

# Instructions for Coding Agents

Before implementing changes:

- Briefly explain the intended approach.
- Prefer minimal changes.
- Do not refactor unrelated code.
- Do not rename files unless necessary.
- Preserve existing project structure.
- Keep commits logically separated.

When implementing:

- Keep code easy to understand.
- Add comments only when they improve understanding.
- Do not over-engineer solutions.

When uncertain:

Choose the simplest implementation that satisfies the requirements.

---

# Preferred Workflow

For every new feature:

1. Understand the requirement.
2. Explain the implementation plan.
3. Implement the smallest working solution.
4. Verify functionality.
5. Refactor only if it improves readability.
6. Stop and wait for feedback before implementing additional features.

Never implement multiple unrelated features in a single change.

---

# Current Scope

Currently in scope:

- Larger custom emojis
- Larger Unicode emojis
- Improved emoji rendering
- CSS-based UI enhancements
- Optional plugin settings

Currently out of scope:

- Server-side business logic
- Database storage
- External services
- Analytics
- Telemetry

Only implement out-of-scope features if explicitly requested.
