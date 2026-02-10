use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::InternalApi;
#[cfg(mobile)]
use mobile::InternalApi;

pub trait InternalApiExtension<R: Runtime> {
  fn api(&self) -> &InternalApi<R>;
}

impl<R: Runtime, T: Manager<R>> InternalApiExtension<R> for T {
  fn api(&self) -> &InternalApi<R> {
    self.state::<InternalApi<R>>().inner()
  }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("o19-ffc")
    .invoke_handler(tauri::generate_handler![
      commands::ping,
      commands::run_sql,
      commands::url_preview_json,
      commands::html_preview_json,
      commands::media_preview_json,
      commands::convert_jpeg_to_webp,
      commands::compress_webp_to_size,
      commands::request_permissions
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let ffc = mobile::init(app, api)?;

      #[cfg(desktop)]
      let ffc = desktop::init(app, api)?;

      app.manage(ffc);

      Ok(())
    })
    .build()
}
