#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod directory_list;
mod save_file;
mod user_dirs;

use directory_list::list;
use save_file::save_file;
use user_dirs::user_dirs;

use fetch_reqwest::{FetchOptions, FetchResponseResult};

#[tauri::command]
async fn fetch_reqwest(resource: String, init: Option<FetchOptions>) -> FetchResponseResult {
    fetch_reqwest::fetch(resource, init).await
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch_reqwest,
            list,
            save_file,
            user_dirs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
