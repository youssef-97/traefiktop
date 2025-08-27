# Argonaut (traefik-tui)

## Project Overview

This project, Argonaut, is a terminal user interface (TUI) for Argo CD. It's built with React and Ink, providing a keyboard-first experience for managing Argo CD applications directly from the terminal. The tool allows users to browse applications, filter by various scopes (clusters, namespaces, projects), view live resource status, trigger synchronizations, inspect differences, and perform rollbacks.

The project is written in TypeScript and uses `bun` as the package manager and runtime.

## Building and Running

### Prerequisites

- Node.js >= 18
- bun >= 1.2.20
- Argo CD CLI

### Installation

Install dependencies using `bun`:

```bash
bun install
```

### Development

To run the application in development mode, use the following command:

```bash
bun run dev
```

### Building

To build the application for production, you can create a Node.js build or a standalone binary:

**Node.js Build:**

```bash
bun run build:node
```

**Binary Build:**

```bash
bun run build:binary
```

### Testing

The project uses `bun test` for running tests. The following commands are available:

- **Run all tests:**
  ```bash
  bun test
  ```
- **Run tests in watch mode:**
  ```bash
  bun test:watch
  ```
- **Run tests with coverage:**
  ```bash
  bun test:coverage
  ```

## Development Conventions

### Linting and Formatting

The project uses Biome for linting and formatting.

- **Check for linting errors:**
  ```bash
  bun run lint
  ```
- **Fix linting errors:**
  ```bash
  bun run lint:fix
  ```
- **Format code:**
  ```bash
  bun run format
  ```

### Source Code Structure

The main source code is located in the `src/` directory. The application entry point is `src/main.tsx`. Other important directories include:

- `src/api/`: Contains the logic for interacting with the Argo CD API.
- `src/components/`: Contains the React components for the UI.
- `src/commands/`: Defines the commands available in the application.
- `src/hooks/`: Contains custom React hooks.
- `src/services/`: Contains various services used by the application.
- `src/__tests__/`: Contains the tests for the application.
