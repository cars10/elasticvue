use serde::Serialize;
use std::path::PathBuf;

#[tauri::command]
pub fn user_dirs() -> UserDirs {
    UserDirs::new()
}

#[derive(Debug, Serialize)]
pub struct UserDirs {
    root: PathBuf,
    home: Option<PathBuf>,
    download: Option<PathBuf>,
    document: Option<PathBuf>,
    desktop: Option<PathBuf>,
}

impl UserDirs {
    pub fn new() -> Self {
        UserDirs {
            root: PathBuf::from("/"),
            home: dirs::home_dir().filter(|p| p.exists()),
            download: dirs::download_dir().filter(|p| p.exists()),
            document: dirs::document_dir().filter(|p| p.exists()),
            desktop: dirs::desktop_dir().filter(|p| p.exists()),
        }
    }
}
