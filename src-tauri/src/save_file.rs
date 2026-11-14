#[tauri::command]
pub async fn save_file(path: String, data: String) -> Option<usize> {
    std::fs::write(path_clean::clean(&path), &data)
        .ok()
        .map(|_| data.len())
}
