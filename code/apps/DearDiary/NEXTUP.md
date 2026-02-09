<!-- vim: ts=2
-->
# Next UP

## Doing

- fix issue with loading posts before backend ready (add ping command)
- fix issue with bad deserialization of NULL type columns in drizzle_proxy.rs
- fix issue with requiring a protocol for links (if no protocol assume https)

## TODO

- Autocomplete for Person lookups

- Media Previews
  - Rust side:
    - change `link_preview` to `html_preview`
    - create new `media_preview` command
      - use `nom-exif` crate
        - if media is remote (http(s))
          - HEAD for media size
          - if size less than MAX_REMOTE_MEDIA_SIZE_FOR_ANALYSIS constant then download all of it to temp
            - otherwise first 64kb of media to temp location location
          - analyze downloaded data
            - create thumbnail if we have downloaded all of it
            - store thumbnail in thumbnail cache (on filesystem)
          - if size less than MAX_REMOTE_MEDIA_SIZE_FOR_SAVING then move from temp
            to permanent filesystem storage
          - remove temp files
    - create new `url_preview` command that calls the correct preview command

  - persistence-tauri
    - Media table
      - URL
      - media meta data as columns
    - transition `linkPreview` service to `preview` service
      - update usage of `link_preview_json` to `url_preview_json`
      - etc

  - DearDiary
    - update usage of `linkPreview` service













## TODO LAAAAAAAAAATTTTEERRRRR
- Make the CTAs furiously rejoice when empty CCCB is tapped. Furiouser still on
  further tapping.
- fix issue with creation area becoming too big in link previews (add button
  disappears)
- bring up the view reel dots from the bottom before the forground layer is
  fully snapped to the top
- fix tiny jank in PostList scrolling (scroll down slowly, notice it jumps by a
  dozen pixels back) because of bad estimate of link previews


## Done and committed

- `pnpm db:cli` in `persistence-drizzle`
- `app.html` now says "DearDiary: today i..."
- svelte-virtuallist for virtual scrolling of posts
