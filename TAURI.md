# Tauri

This branch is used to test [tauri](https://tauri.studio/) integration. I try to use tauri (instead of electron) to
create a desktop app for elasticvue.

For now you can do (make sure to [setup your system](https://tauri.studio/docs/getting-started/prerequisites):

1. Run dev `yarn tauri:dev` (HMR does not work all the time. When in doubt, restart tauri)
2. Build for prod `yarn tauri build`

Not working:

* ctrl+z to revert typing stuff
