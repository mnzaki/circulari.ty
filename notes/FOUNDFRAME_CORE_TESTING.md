# Foundframe Core Testing Plan

> **Status: P0, P1, P2 COMPLETE** ✅ | **120 Tests Passing**

## Philosophy

- **Mid-level**: Test operations that compose multiple functions (e.g., "ingest a chunk" not "sanitize filename")
- **Isolation**: Mock external dependencies (Radicle node, filesystem where practical)
- **Determinism**: Tests should be repeatable and not depend on external state
- **Fast**: Tests run in milliseconds

---

## Implementation Status

| Priority | Module | Test File | Status | Tests |
|----------|--------|-----------|--------|-------|
| **P0** | `signal` | `signal_test.rs` | ✅ Complete | 8 |
| **P0** | `pkb::chunk` | `pkb_chunk_test.rs` | ✅ Complete | 23 |
| **P0** | `pkb::entry` | `pkb_entry_test.rs` | ✅ Complete | 23 |
| **P1** | `media::source` (mock) | `media_source_registry_test.rs` | ✅ Complete | 16 |
| **P1** | `media::source::adapters` | `local_dir_adapter_test.rs` | ✅ Complete | 16 |
| **P2** | `pkb::directory` + `PkbBase` | `pkb_service_integration_test.rs` | ✅ Complete | 18 |
| **P2** | End-to-end workflows | `end_to_end_workflow_test.rs` | ✅ Complete | 16 |
| **P3** | `device` | `device_test.rs` | 🚧 Needs fixing | - |
| **P3** | `thestream` | `thestream_test.rs` | 📋 Planned | - |
| **P3** | `bookmark` | `bookmark_test.rs` | 📋 Planned | - |

**Total: 120 tests passing** 🎉

---

## Test Infrastructure

### Test Helpers (`tests/common/`)

| File | Purpose |
|------|---------|
| `mod.rs` | Re-exports for test modules |
| `temp.rs` | `TestTempDir` - Auto-cleaning temp directories |
| `db.rs` | `TestDatabase` - In-memory mock database with CRUD |

### Mock Implementations

- **MockAdapter** (`media_source_registry_test.rs`) - Full `SourceAdapter` trait implementation
- **TestDatabase** - HashMap-based storage for testing DB-dependent code

---

## P0: Critical Path Tests ✅

### `signal_test.rs` (8 tests)

```rust
test_subscribe_receive_emit          // Basic pub/sub
test_multiple_subscribers_receive    // Fan-out broadcasting
test_dropped_subscriber_removed      // Cleanup on drop
test_events_received_in_order        // FIFO guarantee
test_new_subscriber_doesnt_get_old   // No backlog replay
test_try_emit_non_blocking           // Non-blocking API
test_type_safety_no_cross_contamination // Type isolation
test_pkb_event_emit_and_receive      // PKB-specific events
```

### `pkb_chunk_test.rs` (23 tests)

```rust
// MediaLink
test_medialink_roundtrip             // Write → Read
test_medialink_from_content_trims_whitespace

// StreamChunk filenames
test_chunk_filename_generation_with_title
test_chunk_filename_without_title
test_chunk_filename_sanitizes_title
test_sanitize_filename_removes_unsafe_chars
test_sanitize_filename_limits_length

// File extensions
test_chunk_file_extension_medialink
test_chunk_file_extension_textnote
test_chunk_file_extension_structured_data

// Ingestion
test_chunk_ingest_medialink_creates_file
test_chunk_ingest_creates_parent_directories

// Detection
test_chunk_detect_from_path_mln
test_chunk_detect_from_path_jsmd
test_chunk_detect_from_path_md
test_chunk_detect_from_path_unknown

// ID generation
test_entry_id_generation_deterministic // BLAKE3 content hash

// Temp utilities
test_temp_dir_creation, test_temp_dir_cleanup
test_pkb_base, test_insert_and_get, test_update_cursor, test_list_active
```

### `pkb_entry_test.rs` (23 tests)

```rust
// Roundtrips
test_text_note_roundtrip             // Entry → js.md → Entry
test_entry_file_roundtrip            // Entry → file → Entry
test_entry_metadata_preserved_roundtrip

// Without title
test_text_note_without_title

// Structured data extraction
test_structured_data_extraction_content_field
test_structured_data_extraction_body_field
test_structured_data_extraction_text_field
test_structured_data_extraction_markdown_field
test_structured_data_multiple_content_fields_concatenated
test_structured_data_preserves_unknown_fields_in_extra
test_structured_data_title_from_extra

// Format
test_js_md_format_structure

// Parsing
test_parse_entry_without_title_heading
test_parse_entry_with_empty_lines

// Edge cases
test_parse_entry_with_unknown_dbtype
test_entry_with_empty_content
test_entry_with_only_title
test_whitespace_only_content

// ID
test_entry_id_from_meta_roundtrip
```

---

## P1: Component Tests ✅

### `media_source_registry_test.rs` (16 tests)

```rust
// Capabilities
test_source_capability_variants      // Pull/Push/Stream distinct
test_mock_adapter_capabilities

// PullConfig
test_pull_config_default             // 5min interval, 100 batch, etc.

// MockAdapter lifecycle
test_mock_adapter_pull_returns_items
test_mock_adapter_push_lifecycle     // setup → callback → teardown
test_mock_adapter_validate_pull_always_succeeds

// MediaItem
test_media_item_creation
test_media_location_variants         // Url/LocalPath/Inline

// Config serialization
test_source_config_serialization

// URL parsing
test_parse_scheme_from_url           // file://, https://, etc.
```

### `local_dir_adapter_test.rs` (16 tests)

```rust
// Capabilities
test_local_dir_adapter_capabilities  // Pull only, no Push

// File discovery
test_local_dir_poll_finds_images     // jpg, png, gif
test_local_dir_poll_respects_cursor  // Incremental scanning
test_local_dir_poll_empty_directory
test_local_dir_poll_nested_directories // Recursive traversal
test_local_dir_finds_visible_files

// Content detection
test_local_dir_detects_mime_types    // image/jpeg, image/png
test_local_dir_generates_content_info // size, hash (BLAKE3)

// Validation
test_local_dir_validate_pull_succeeds_for_valid_dir

// URL format
test_local_dir_items_have_correct_source_url
```

---

## P2: Integration Tests ✅

### `pkb_service_integration_test.rs` (18 tests)

```rust
// PkbBase
test_pkb_base_directory_structure    // directories/ created
test_pkb_base_name_validation        // Valid/invalid names
test_pkb_base_directory_paths
test_pkb_base_tracks_directories

// EventBus PKB events
test_event_bus_pkb_events            // SyncStarted/Completed
test_event_bus_entry_created
test_event_bus_entry_pulled
test_event_bus_full_workflow_events  // Event ordering

// StreamChunk
test_streamchunk_file_extensions     // mln vs js.md
test_streamchunk_filename_sanitization
test_streamchunk_detection_from_path

// Entry ID
test_entry_id_uniqueness             // Different content → different hash
```

### `end_to_end_workflow_test.rs` (16 tests)

```rust
// Complete user workflows
test_workflow_create_notes_directory // Meta + git init
test_workflow_add_text_notes         // With/without titles
test_workflow_import_media_links     // .mln files
test_workflow_import_structured_data // Bookmarks → JSON
test_workflow_content_hashing        // BLAKE3 determinism
test_workflow_parse_entry_filenames  // timestamp + title
test_workflow_multiple_directories_isolated // Separate git repos
test_workflow_entry_modification     // Versioning via ID change
test_workflow_batch_entry_creation   // 50 entries < 1s
test_workflow_error_handling         // Auto-dir creation, not-found errors
```

---

## Test File Structure

```
crates/foundframe/
├── src/
│   └── ...
└── tests/
    ├── common/
    │   ├── mod.rs          # Re-exports
    │   ├── temp.rs         # TestTempDir
    │   └── db.rs           # TestDatabase
    ├── signal_test.rs           # P0 ✅
    ├── pkb_chunk_test.rs        # P0 ✅
    ├── pkb_entry_test.rs        # P0 ✅
    ├── media_source_registry_test.rs  # P1 ✅
    ├── local_dir_adapter_test.rs      # P1 ✅
    ├── pkb_service_integration_test.rs # P2 ✅
    └── end_to_end_workflow_test.rs     # P2 ✅
```

---

## Running Tests

```bash
# All P0 + P1 + P2 tests (120 tests, < 2s)
cargo test -p o19-foundframe --tests

# Just P0 (fast feedback - 54 tests)
cargo test -p o19-foundframe \
  --test pkb_chunk_test \
  --test pkb_entry_test \
  --test signal_test

# Just P1 (async + mocks - 32 tests)
cargo test -p o19-foundframe \
  --test media_source_registry_test \
  --test local_dir_adapter_test

# Just P2 (integration - 34 tests)
cargo test -p o19-foundframe \
  --test pkb_service_integration_test \
  --test end_to_end_workflow_test

# With output
cargo test -p o19-foundframe -- --nocapture
```

---

## Guidelines

### DO:
- ✅ Test **behavior**, not implementation
- ✅ Use temp directories/files, clean up after
- ✅ Mock external dependencies (Radicle, network)
- ✅ Test error cases (invalid input, file not found)
- ✅ Use descriptive test names: `test_<scenario>_<expected_result>`
- ✅ Test async code with `tokio::test`
- ✅ Use common test infrastructure (`TestTempDir`, `TestDatabase`)

### DON'T:
- ❌ Test private functions directly
- ❌ Depend on external state (real Radicle node, network)
- ❌ Use `sleep()` or timeouts (should be deterministic)
- ❌ Test getters/setters without logic
- ❌ Write "happy path only" tests

---

## What's Next (P3)

| Module | Priority | Blockers |
|--------|----------|----------|
| `device` | P3 | Mock Radicle NodeHandle |
| `thestream` | P3 | Mock PkbService integration |
| `bookmark` | P3 | Simple CRUD - straightforward |

---

## Known Issues

- `device::tests::test_paired_device_has_access` - Pre-existing failure (Length validation)

---

> *"Test the contracts, not the code."* 🧪
> 
> *"120 tests and counting..."* 🚀
