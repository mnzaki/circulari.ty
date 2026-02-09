mod drizzle_proxy;
mod html_preview;
mod media_preview;
include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

/// Simple health check command - returns "pong" when backend is ready
#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

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
        .invoke_handler(tauri::generate_handler![
            ping, 
            drizzle_proxy::run_sql, 
            html_preview::html_preview_json,
            media_preview::url_preview_json,
            media_preview::media_preview_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
