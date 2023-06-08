#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod load_file;
mod menu;
mod save_file;

use load_file::load_file;
use menu::menu;
use save_file::save_file;

use fetch_reqwest::{FetchOptions, FetchResponseResult};

#[tauri::command]
async fn fetch_reqwest(resource: String, init: Option<FetchOptions>) -> FetchResponseResult {
    fetch_reqwest::fetch(resource, init).await
}

fn main() {
    let ctx = tauri::generate_context!();

    tauri::Builder::default()
        .menu(menu(&ctx))
        .invoke_handler(tauri::generate_handler![
            fetch_reqwest,
            load_file,
            save_file
        ])
        .run(ctx)
        .expect("error while running tauri application");
}
