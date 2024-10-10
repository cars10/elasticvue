use tauri::menu::{AboutMetadataBuilder, Menu, MenuBuilder, SubmenuBuilder};
use tauri::{App, Wry};

pub fn menu(app: &mut App) -> Result<Menu<Wry>, tauri::Error> {
    let metadata = AboutMetadataBuilder::new()
        .version(Some(app.package_info().version.to_string()))
        .authors(Some(vec![app.package_info().authors.to_string()]))
        .comments(Some(app.package_info().description))
        .website(Some("https://elasticvue.com"))
        .icon(app.default_window_icon().map(|img| img.clone()))
        .build();

    let about_quit = SubmenuBuilder::new(app, app.package_info().name.clone())
        .about(metadata.into())
        .quit()
        .build()?;

    let edit = SubmenuBuilder::new(app, "Edit")
        .copy()
        .paste()
        .undo()
        .redo()
        .separator()
        .select_all()
        .build()?;

    let menu = MenuBuilder::new(app).build()?;

    menu.append(&about_quit)?;
    menu.append(&edit)?;
    Ok(menu)
}
