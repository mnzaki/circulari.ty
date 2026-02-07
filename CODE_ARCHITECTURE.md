# Architecture: Code

All 3 (4?) apps share a common ancestor codebase, which will eventually develop
into a starter-kit for building new apps on the implied network.

This codebase is a monorepo broken down into a few packages and has an `apps`
dir with an example app pulling in all the packages.

The monorepo brings together:
- pnpm + turbo
- Typescript
- Tauri
- SvelteKit


And code packages for the foundations:
- Identity management
- Content storage
  - by content hash
  - with metadata
  - transparently over physical storage
- Peer management
  - finding peers
  - connecting to peers
