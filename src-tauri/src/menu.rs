use tauri::menu::{AboutMetadataBuilder, Menu, MenuBuilder, SubmenuBuilder};
use tauri::{App, Wry};

pub fn menu(app: &mut App) -> Result<Menu<Wry>, tauri::Error> {
    let metadata = AboutMetadataBuilder::new()
        .version(Some(app.package_info().version.to_string()))
        .authors(Some(vec![app.package_info().authors.to_string()]))
        .comments(Some(app.package_info().description))
        .website(Some("https://elasticvue.com"))
        .icon(app.default_window_icon().cloned())
        .build();

    let mut app_menu =
        SubmenuBuilder::new(app, app.package_info().name.clone()).about(metadata.into());
    if cfg!(target_os = "macos") {
        app_menu = app_menu
            .separator()
            .services()
            .separator()
            .hide()
            .hide_others()
            .show_all();
    }
    let app_menu = app_menu.separator().quit().build()?;

    let edit = SubmenuBuilder::new(app, "Edit")
        .copy()
        .paste()
        .cut()
        .undo()
        .redo()
        .separator()
        .select_all()
        .build()?;

    let menu = MenuBuilder::new(app).build()?;

    menu.append(&app_menu)?;
    menu.append(&edit)?;

    #[cfg(target_os = "macos")]
    {
        let window = SubmenuBuilder::new(app, "Window")
            .minimize()
            .maximize()
            .separator()
            .fullscreen()
            .separator()
            .close_window()
            .build()?;
        menu.append(&window)?;
        window.set_as_windows_menu_for_nsapp()?;
    }

    Ok(menu)
}
