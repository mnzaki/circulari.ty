#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    /**** DEBUGGING ****/
    // Initialize the console subscriber to listen on port 6669
    #[cfg(feature = "tokio_debugging")]
    {
        // 1. Initialize the subscriber
        console_subscriber::init();

        // 2. Log so you know it's running
        // (Make sure you have a logger set up, or use println!)
        println!("Wait! Tokio Console Subscriber is listening on port 6669...");
    }
    // Turn on backtraces
    std::env::set_var("RUST_BACKTRACE", "full");
    /*** /DEBUGGING ****/

    // Database migrations
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
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
        .plugin(o19_foundframe_tauri::init())
        .plugin(tauri_plugin_opener::init())
        //.invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
