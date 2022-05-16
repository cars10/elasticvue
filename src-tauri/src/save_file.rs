use serde::Serialize;
use std::io::prelude::*;
use std::path::PathBuf;

#[tauri::command]
pub async fn save_file(path: String, file_name: String, data: String) -> FileSaveResult {
    let mut save_path = PathBuf::new();
    save_path.push(path_clean::clean(&path));
    save_path.push(path_clean::clean(&file_name));

    if save_path.exists() {
        return FileSaveResult::from_err(FileSaveError::AlreadyExists);
    };

    let mut file = match std::fs::File::create(&save_path) {
        Ok(file) => file,
        Err(_) => return FileSaveResult::from_err(FileSaveError::IoError),
    };

    let written = match file.write(data.as_bytes()) {
        Ok(written) => written,
        Err(_) => return FileSaveResult::from_err(FileSaveError::IoError),
    };

    if save_path.exists() {
        FileSaveResult::from_written(written)
    } else {
        FileSaveResult::from_err(FileSaveError::FileMissingError)
    }
}

#[derive(Debug, Serialize)]
pub struct FileSaveResult {
    success: bool,
    written: Option<usize>,
    error_msg: Option<String>,
    error: Option<FileSaveError>,
}

impl FileSaveResult {
    fn from_written(written: usize) -> Self {
        FileSaveResult {
            success: true,
            written: Some(written),
            error_msg: None,
            error: None,
        }
    }

    fn from_err(error: FileSaveError) -> Self {
        FileSaveResult {
            success: false,
            written: None,
            error_msg: Some(format!("{}", error)),
            error: Some(error),
        }
    }
}

#[derive(Debug, Serialize)]
pub enum FileSaveError {
    AlreadyExists,
    IoError,
    FileMissingError,
}

impl std::fmt::Display for FileSaveError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match *self {
            FileSaveError::AlreadyExists => write!(f, "File already exists"),
            FileSaveError::IoError => write!(f, "Io Error"),
            FileSaveError::FileMissingError => write!(f, "Cannot save file"),
        }
    }
}
