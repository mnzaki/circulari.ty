use tauri::{AppHandle, Manager};

include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Database migrations
    let migrations = load_migrations();

    tauri::Builder::default()
        .plugin(tauri_plugin_o19_ffc::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:deardiary.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            ping, 
            run_sql, 
            html_preview_json,
            url_preview_json,
            media_preview_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
