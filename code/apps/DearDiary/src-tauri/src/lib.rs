include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Turn on backtraces
    std::env::set_var("RUST_BACKTRACE", "1");

    // Database migrations
    let migrations = load_migrations();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Debug)
                .target(tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::Stdout,
                ))
                .target(tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::Webview,
                ))
                .build(),
        )
        .plugin(tauri_plugin_o19_ffi::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:deardiary.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        //.invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
