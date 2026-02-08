mod drizzle_proxy;
mod link_preview;
include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Database migrations
    let migrations = load_migrations();
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:deardiary.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![drizzle_proxy::run_sql, link_preview::link_preview_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
