# NEXTUP

The main focus is [DearDiary's NEXTUP.md](./apps/DearDiary/NEXTUP.md)

Here we have more high level goals with a concentration on `foundframeimpl`
covering as many bases as possible as quickly as possible. Because that's the
focal point of the [circular](../CIRCULARI.TY.md) [spirali.ty](../O19.md) of the
[o19](https://github.com/mnzaki/o19).

# Doing

- pkb support in `foundframeimpl`
  - write to local files in `$HOME/pkb/${DIRECTORY}/some_path/some_file.ext` structure
    - on mobile devices: somewhere that the user can access easily, not inside
      app data dirs
  - `Directory` is a high level categorization of knowledge along an arbitrary
    axis, like
    - "screenrecs"
    - "screenshots"
    - "notes"
    - "memes"
    - "music"
    - "pomodoro"
  - User is free to add arbitrary data to arbirary paths in a directory
    - media is stored as `.mln` files
    - DB records (any non-media `StreamChunk` or even a `Stream` entry) are stored as json
      files
      - tagged with a `__dbType` property, then all fields at root level
        recursively
      - printed with spaces
      - stored with filenames `<creation> <title?>.js.md` to be accidentally
        readable in UIs
        - basically we reformat the json into a broken quine
          - first line prints the input json, but reformated in the preceding
            lines to also be correct markdown
            - and by "correct markdown" I mean minimally
              - basically when at a JSON property that is known to be markdown
                (or is just multiparagraph or other simple heurists) then print
                it out in the generated code with no indentation, and with the
                preceding opening quote on a separate line above.
            - similarly for JSON properties that hold a URL, print it out with
              empty lines around it and place it at column 0 so it's clear
  - User must create directories carefully though
    - choose a short name
    - write a description of at least 16 chars
    - pick an optional emoji, color
  - `Directory` also has related `StreamChunkHeuristics`
    - these are user defined heuristics for whether a given `StreamChunk` should
      go to a given `Directory`
    - The philosophy is to never do things automatically for the user, but always
      have it one tap away to incorporate the system's knowledge rather than the
      system acting unchecked. The PKB is a very personal thing, it's in the
      name, *Personal* Knowledge Base. So in the case of adding an incoming
      `StreamChunk` to the appropriate `Directory`, we provide commands to guess
      the chunk, and the UI doesn't autotag.
      - the system does not force, but only guides
    - `Directories` of course map to FS dirs, and their metadata should go into
      a file in them, `.pkb.meta.json`, which is normally hidden in all UIs
  - So high level, current pkb features required to establish a transparent
    workflow between a laptop and a mobile phone by syncing PKB contents which
    themselves will be links to media and data, and are always (any device type)
    stored as a local filesystem are:
    - CRUD a `Directory`
    - CRUD a `StreamChunkHeuristic`
    - Injest a `StreamChunk` with target `Directory` and `path`, as a new
      `Entry`
      - no injesting without targets, we won't guess for you automatically
    - RUD an entry
  - Clearly knowledge of `StreamChunks` is now needed in `foundframeimpl` and I
    think that's apropos.

# TODO

- mln support in `foundframeimpl`

- 2-phase loading of rust core
  - phase-1 minimal parts of core tauri, no plugins no deps

- 2 different storage spaces:
  - shortterm
      - total size limited
      - LeastRecentlyUsed expiry algorithm applied when over-capacity
      - looser default publication restrictions
      - not redundantly stored much
  - longterm
    - no total size limit
    - private by default
    - redundantly stored

- `android-activities` flutter based package for easy modular screens
- `ios-activities` later


- A thank you screen for supporting the cause
  - from a "help us, stay?" page


- "Notify Seen" button on content by other people
  - long tap to get options:
      - "always `notify seen` for this person"
      - "turn on autonotify seen"
  - on tap -> person.service.


## Social Studies


- notify seen

- contract to not be able to see certain media or posts until a given future date.
  - implemented as the feature "keep it from me"
    - applicable on any `StreamChunk`
    - packs (compress and encrypt using newly minted keys) and uploads the
      chosen chunks to a target peer, and gives them they keys and the release
      date, then deletes everything from the local device.


# Laaaaaaaaaaaaater

- Stream Feature: hide this chunk
  - takes it to "hidden stream" which is accessible from a menu button
    - in hidden stream, a more dangerous looking privacy button says, "secret
      this chunk"
      - it moves the chunk to encrypted storage
        - encrypted storage is accessible from a high friction UI with optional
          plausible deniability features and obscurement

- Pokédex Skin
  - `DearDiary` but UI is Pokédex

- When `ForegroundLayer` fills screen, show a "capture camera" icon button in the
  same bottom corner as the devices natural/builtin "back" button
    - important detail; try to make an educated guess about whether back button
      exists and is left or right, and if no information then guess based on
      default system language being RTL or LTR

