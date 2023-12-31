/*
 *
 *  | BUILD_MODE        | SSL Hint | CORS Hint | Router Mode    | Use Tauri | Check predefined clusters |
 *  |-------------------|----------|-----------|----------------|-----------|---------------------------|
 *  | web               | ✓        | ✓         | webHistory     | X         | X                         |
 *  | docker            | ✓        | ✓         | webHistory     | X         | ✓                         |
 *  | browser_extension | ✓        | X         | webHashHistory | X         | X                         |
 *  | tauri             | X        | X         | webHistory     | ✓         | X                         |
 *
 */

export enum BuildMode {
  web = 'web', // default, "normal" build
  docker = 'docker',
  browser_extension = 'browser_extension',
  tauri = 'tauri'
}

const buildMode = import.meta.env.VITE_APP_BUILD_MODE || BuildMode.web
export const buildConfig = {
  tauri: buildMode === BuildMode.tauri,
  router: {
    base: import.meta.env.VITE_APP_PUBLIC_PATH || '/',
    mode: buildMode === BuildMode.browser_extension ? 'webHashHistory' : 'webHistory'
  },
  hints: {
    ssl: [BuildMode.web, BuildMode.docker, BuildMode.browser_extension].includes(buildMode),
    cors: [BuildMode.web, BuildMode.docker].includes(buildMode),
  },
  checkPredefinedClusters: buildMode === BuildMode.docker
}
