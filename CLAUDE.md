# CLAUDE.md - OpenStad Headless Development Guide

## Build & Run Commands
- `npm run dev` - Start all services in development mode
- `npm run lint` - Run linting across all workspaces
- `npm run check` - Run Biome checks with summary reporter
- `npm run fix` - Run Biome checks and auto-fix issues
- `npm run test` - Run unit tests
- `npm run test:unit` - Run unit tests (alias)
- `npm run test:unit:watch` - Run unit tests in watch mode
- `npm run test:e2e` - Run end-to-end tests
- `npm test -- -t "test name"` - Run a specific test

## Code Style Guidelines
- **Formatting**: Uses Biome.js for linting and formatting.
- **Imports**: Group by source type with internal imports last.
- **TypeScript**: Use TypeScript for new components, follow existing type patterns.
- **Naming**: CamelCase for variables/functions, PascalCase for components/classes.
- **Error Handling**: Use try/catch for async operations, handle errors gracefully.
- **React Components**: Function components preferred with hooks for state management.
- **Linting**: Run Biome checks before committing (`npm run check`).

## Project Structure
- `/apps` - Core server applications (api, auth, cms, admin, image)
- `/packages` - Shared components and libraries
- `/scripts` - Setup and utility scripts
