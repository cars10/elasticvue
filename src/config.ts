/*
 *
 *  | BUILD_MODE        | SSL Hint | CORS Hint | Router Mode    | Use Tauri |
 *  |-------------------|----------|-----------|----------------|-----------|
 *  | native            | ✓        | ✓         | webHistory     | X         |
 *  | browser_extension | ✓        | X         | webHashHistory | X         |
 *  | tauri             | X        | X         | webHistory     | ✓         |
 *
 */

export enum BuildMode {
  web = 'web',
  browser_extension = 'browser_extension',
  tauri = 'tauri'
}

const buildMode = import.meta.env.VITE_APP_BUILD_MODE || BuildMode.web
export const buildConfig = {
  tauri: buildMode === BuildMode.tauri,
  router: {
    mode: buildMode === BuildMode.browser_extension ? 'webHashHistory' : 'webHistory'
  },
  hints: {
    ssl: buildMode === BuildMode.web || buildMode === BuildMode.browser_extension,
    cors: buildMode === BuildMode.web,
  }
}
