# CLAUDE.md - OpenStad Headless Development Guide

## Build & Run Commands
- `pnpm run dev` - Start all services in development mode
- `pnpm run lint` - Run linting across all workspaces
- `pnpm run check` - Run Biome checks with summary reporter
- `pnpm run fix` - Run Biome checks and auto-fix issues
- `pnpm run test` - Run unit tests
- `pnpm run test:unit` - Run unit tests (alias)
- `pnpm run test:unit:watch` - Run unit tests in watch mode
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm test -- -t "test name"` - Run a specific test

## Code Style Guidelines
- **Formatting**: Uses Biome.js for linting and formatting.
- **Imports**: Group by source type with internal imports last.
- **TypeScript**: Use TypeScript for new components, follow existing type patterns.
- **Naming**: CamelCase for variables/functions, PascalCase for components/classes.
- **Error Handling**: Use try/catch for async operations, handle errors gracefully.
- **React Components**: Function components preferred with hooks for state management.
- **Linting**: Run Biome checks before committing (`pnpm run check`).

## Project Structure
- `/apps` - Core server applications (api, auth, cms, admin, image)
- `/packages` - Shared components and libraries
- `/scripts` - Setup and utility scripts
