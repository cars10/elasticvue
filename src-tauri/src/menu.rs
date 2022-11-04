use tauri::{AboutMetadata, Assets, Context, Menu, MenuEntry, MenuItem, Submenu};

pub fn menu<A: Assets>(ctx: &Context<A>) -> Menu {
    Menu::with_items([
        #[cfg(target_os = "macos")]
        MenuEntry::Submenu(Submenu::new(
            &ctx.package_info().name,
            Menu::with_items([
                MenuItem::About(ctx.package_info().name.clone(), AboutMetadata::default()).into(),
                MenuItem::Separator.into(),
                MenuItem::Services.into(),
                MenuItem::Separator.into(),
                MenuItem::Hide.into(),
                MenuItem::HideOthers.into(),
                MenuItem::ShowAll.into(),
                MenuItem::Separator.into(),
                MenuItem::Quit.into()
            ]),
        )),
        #[cfg(not(target_os = "macos"))]
        MenuEntry::Submenu(Submenu::new(
            "File",
            Menu::with_items([
                MenuItem::Quit.into()
            ]),
        )),
        #[cfg(not(target_os = "linux"))]
        MenuEntry::Submenu(Submenu::new(
            "Edit",
            Menu::with_items([
                MenuItem::Undo.into(),
                MenuItem::Redo.into(),
                MenuItem::Separator.into(),
                MenuItem::Cut.into(),
                MenuItem::Copy.into(),
                MenuItem::Paste.into(),
                #[cfg(not(target_os = "macos"))]
                MenuItem::Separator.into(),
                MenuItem::SelectAll.into()
            ]),
        )),
        #[cfg(not(target_os = "linux"))]
        MenuEntry::Submenu(Submenu::new(
            "Window",
            Menu::with_items([
                MenuItem::Minimize.into(),
                MenuItem::Zoom.into()
            ]),
        )),
    ])
}
