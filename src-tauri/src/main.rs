#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod load_file;
mod save_file;

use load_file::load_file;
use save_file::save_file;

use fetch_reqwest::{FetchOptions, FetchResponseResult};

#[tauri::command]
async fn fetch_reqwest(resource: String, init: Option<FetchOptions>) -> FetchResponseResult {
    fetch_reqwest::fetch(resource, init).await
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch_reqwest,
            load_file,
            save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
