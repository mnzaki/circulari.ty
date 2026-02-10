# Circulari.ty

This is the code; a monorepo. Assuming you have read
[../CIRCULARI.TY.md](../CIRCULARI.TY.md) which explains the spiral idea, here
you find all the `apps`.

There are also `packages`, but these are just copied over from
[o19](https://github.com/mnzaki/o19) which aspires to be a foundational
framework for Circulari.ty apps.

## Monorepo things

### Prereqs

You will need installed globally:

- [Node.js](https://nodejs.org/) (for all frontend apps)
- [pnpm](https://pnpm.io/) (monorepo uses pnpm workspaces)
- [Rust](https://rustup.rs/) (for native code on mobile)
- `cargo install bacon` (it's a rust code watcher/rebuilder)
- install a package for `webkit2gtk-4.1` if you are on linux because Tauri is
  picky
- `pnpm install` for enumerable npm happiness

### Doing the dev

- `pnpm tauri:dev:DearDiary`

### Create a new Tauri app

```sh
cd apps
pnpm create tauri-app -t svelte-ts AnAwesomeApp
```

Then add these scripts to `apps/AnAwesomeApp/package.json`:

```json
...
  "scripts": {
    ...,
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
...
```

And add any packages you need from the monorepo to
`apps/AnAwesomeApp/package.json`:

```json
  ...,
  "dependencies": {
    ...,
    "@repo/ui": "workspace:*"
  }
```

And update `turbo.json` to add these `tasks` if missing:

```json
{
  ...,
  "tasks": {
    ...,
    "tauri:dev": {
      "cache": false,
      "persistent": true
    },
    "tauri:build": {
      "outputs": ["src-tauri/target/**"]
    }
  }
}
```
