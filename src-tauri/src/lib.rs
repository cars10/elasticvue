use fetch_reqwest::{FetchOptions, FetchResponseResult};

mod load_file;
mod menu;
mod save_file;

use load_file::load_file;
use save_file::save_file;

#[tauri::command]
async fn fetch_reqwest(resource: String, init: Option<FetchOptions>) -> FetchResponseResult {
    fetch_reqwest::fetch(resource, init).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    let ctx = tauri::generate_context!();
    // std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    // std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let menu = menu::menu(app)?;
            app.set_menu(menu)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_reqwest,
            load_file,
            save_file
        ])
        .run(ctx)
        .expect("error while running tauri application");
}
