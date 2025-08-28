# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (Ink/React TUI). Key areas: `components/`, `logic/`, `services/`, `hooks/`, `api/`, `utils/`, `tui/`, `contexts/`.
- Types: `src/types/`.
- Tests: colocated `*.test.ts` / `*.test.tsx` beside sources.
- Builds: `dist/` (bundled CLI, licenses) and `out/` (temporary output).
- Tools: `tools/` (e.g., `tools/logs.ts`). Sample data: `routers.json`, `services.json`.

## Build, Test, and Development Commands
- `bun run dev`: run the TUI entry (`src/main.tsx`) in dev.
- `bun run tsx`: run via `tsx` for fast TypeScript execution.
- `bun run build:node`: rollup ESM bundle to `dist/cli.js`.
- `bun run build:binary`: Bun single-file binary from `src/main.tsx`.
- `bun run test` | `test:watch` | `test:coverage`: unit tests with optional watch/coverage (lcov).
- `bun run logs`: pretty-print last session logs (`tools/logs.ts`).

Requirements: Bun >= 1.2.20, Node >= 18.

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode), JSX: `react-jsx`.
- Formatting/Linting: Biome. Use 2-space indent, double quotes, and fix via `bun run lint:fix` and `bun run format`.
- Naming: React components `PascalCase`, files `PascalCase.tsx` for components, helpers `camelCase.ts`. Tests mirror source names with `.test.ts(x)`.

## Testing Guidelines
- Frameworks: Bun test runner, `@testing-library/react`, `ink-testing-library`.
- Scope: prefer unit tests in the same folder as implementation.
- Naming: `*.test.ts` or `*.test.tsx`.
- Run: `bun run test` (CI uses `test:ci` with lcov output).

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits where practical (`feat:`, `fix:`, `refactor:`, `chore:`, `revert:`). Keep subjects concise.
- PRs: include purpose, screenshots/asciicasts of the TUI when visual behavior changes, reproduction/testing steps, and linked issues.

## Security & Configuration Tips
- Traefik API URL: `src/main.tsx` passes `apiUrl` to the UI. Update it for your environment before running.
- TLS: development fetch disables SSL verification; do not ship this behavior to production.
 
