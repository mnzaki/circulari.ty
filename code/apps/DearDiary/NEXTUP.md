<!-- vim: ts=2
-->
# Next UP

## Doing


## TODO

- PKB Support
  - 

- When a naked media item or url is added to the stream, capture it as such and
  don't wrap it in a Post because @doniashohdy insisted telepathically and I was
  gonna do it anyway but it's good to write things down you know?
  
- Media Daemons
  - We need some rusty long running tasks that monitor the common filesystem
    areas where new media is added (currently only camera photos, but designed
    for more later once we figure out UX)
  - 

- Fix ReceiveShareIntent actions (none work)

- Autocomplete for Person lookups

- Make things clickable (media, links, etc)


- UX things
  - ForegroundLayer needs to be pull-downable from CCCB
  - ReceiveShareIntent needs more padding at the bottom
  - ReceiveShareIntent can have a faux CCCB that is clickable/draggable to go to
    the MainActivity, which loads ready with the editing tools preloaded with
    the shared content













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

- The Feed 2.0: it's TheStream™ now
  - It is not WHEN a thing was created that is important, it is when the thing
    is first _seen_
  - One remembers one's experience, not the thing initself
  - TheStream™ reflects this. It is a thing initself, not the things in it
    inthemselves
    - some stream chunks are just a single Post
    - another chunk might be a handful of camera photos that were taken right
      before this post
    - another still might be remote object, like a social media conversation
    - or maybe a wholeass person?
  - TheStream™ just points to what is in the other tables, and this will reflect
    as a polymorphic foreign key, and I have what I think is an interesting
    approach of implementation: each column in `thefeed` table is the name of a
    table that can be seen instream and is a nullable FK to it.
  - Let's keep the word "feed" as the badge for the unfiltered TheStream™


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

- fix issue with loading posts before backend ready (add ping command)
- fix issue with bad deserialization of NULL type columns in drizzle_proxy.rs
- fix issue with requiring a protocol for links (if no protocol assume https)

- `pnpm db:cli` in `persistence-drizzle`
- `app.html` now says "DearDiary: today i..."
- svelte-virtuallist for virtual scrolling of posts

