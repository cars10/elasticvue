use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let submenu = Submenu::new("File", Menu::new().add_item(quit));

    Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
        .add_native_item(MenuItem::Cut)
        .add_native_item(MenuItem::Undo)
        .add_native_item(MenuItem::Redo)
        .add_submenu(submenu)
    }
