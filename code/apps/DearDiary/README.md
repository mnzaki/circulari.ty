# DearDiary

A feed of oneself, for oneself, by oneself elaborating on the past to better see the future.

## Tech Stack

- **Tauri v2** - Desktop app framework
- **SvelteKit 5** - Frontend framework with runes
- **TypeScript** - Type safety
- **SQLite** - Local database via Tauri SQL plugin
- **Drizzle Kit** - Database migrations

## Development

### Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (monorepo uses pnpm workspaces)

### Running the App

**Important:** This app requires the Tauri runtime and cannot run in a regular browser.

```bash
# Start the Tauri dev environment
pnpm tauri:dev

# Or from within this directory
npm run tauri:dev
```

The `vite dev` command (or `npm run dev`) is only for Vite's build server and will show an error if opened directly in a browser.

### Building

```bash
# Build for production
pnpm tauri:build

# Or
npm run tauri:build
```

### Database

```bash
# Generate migrations from schema
pnpm db:generate

# Reset database (deletes local SQLite file)
pnpm db:drop
```

The database file is stored at:
- **Linux**: `~/.config/ty.circulari.DearDiary/deardiary.db`
- **macOS**: `~/Library/Application Support/ty.circulari.DearDiary/deardiary.db`
- **Windows**: `%APPDATA%\ty.circulari.DearDiary\deardiary.db`

## Architecture

### Monorepo Structure

```
circulari.ty/code/
├── apps/DearDiary/          # This app
├── packages/
│   ├── persistence/         # Core types & interfaces
│   └── persistence-tauri/   # Tauri SQL adapter
```

### Error Boundaries

The app uses Svelte error boundaries to isolate failures:

- `PostCard` failures don't crash the entire feed
- `ViewReel` failures don't crash the entire app
- Initialization errors show clear messages instead of blank screens

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
