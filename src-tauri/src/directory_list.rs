use serde::Serialize;
use std::cmp::Ordering;
use std::fs::read_dir;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
pub struct DirectoryList {
    path: PathBuf,
    children: Vec<DirectoryEntry>,
}

impl DirectoryList {
    pub fn new(path: PathBuf, children: Vec<DirectoryEntry>) -> Self {
        DirectoryList { path, children }
    }
}

#[tauri::command]
pub async fn list(path: Option<String>) -> DirectoryList {
    let path = path.map_or_else(
        || dirs::download_dir().unwrap(),
        |path| PathBuf::from(path_clean::clean(&path)),
    );

    let dir = Directory::new(path.clone());
    DirectoryList::new(path, dir.ls())
}

#[derive(Debug, Serialize)]
pub struct Directory {
    path: PathBuf,
}

impl Directory {
    pub fn new(path: PathBuf) -> Self {
        Directory { path }
    }

    pub fn ls(&self) -> Vec<DirectoryEntry> {
        let mut entries = read_dir(&self.path).map_or_else(
            |_| Vec::new(),
            |paths| {
                paths
                    .flatten()
                    .flat_map(DirectoryEntry::new)
                    .collect::<Vec<DirectoryEntry>>()
            },
        );

        entries.sort();
        entries
    }
}

#[derive(Debug, Serialize, Eq)]
pub struct DirectoryEntry {
    path: PathBuf,
    file_name: String,
    clean_file_name: String,
    is_dir: bool,
}

impl DirectoryEntry {
    pub fn new(entry: std::fs::DirEntry) -> Option<Self> {
        let is_dir = entry.file_type().ok()?.is_dir();
        let file_name = entry.file_name().into_string().ok()?;

        Some(DirectoryEntry {
            path: entry.path(),
            clean_file_name: file_name.to_lowercase().trim().to_string(),
            file_name,
            is_dir,
        })
    }
}

impl Ord for DirectoryEntry {
    fn cmp(&self, other: &Self) -> Ordering {
        self.file_name.cmp(&other.file_name)
    }
}

impl PartialOrd for DirectoryEntry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for DirectoryEntry {
    fn eq(&self, other: &Self) -> bool {
        self.file_name == other.file_name
    }
}
