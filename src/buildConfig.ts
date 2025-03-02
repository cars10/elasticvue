/*
 *
 *  | BUILD_MODE        | SSL Hint | CORS Hint | Router Mode    | Use Tauri | Check predefined clusters |
 *  |-------------------|----------|-----------|----------------|-----------|---------------------------|
 *  | other             | ✓        | ✓         | webHistory     | X         | X                         |
 *  | docker            | ✓        | ✓         | webHistory     | X         | ✓                         |
 *  | browser_extension | ✓        | X         | webHashHistory | X         | X                         |
 *  | tauri             | X        | X         | webHistory     | ✓         | X                         |
 *
 */

export enum BuildMode {
  docker = 'docker',
  browser_extension = 'browser_extension',
  tauri = 'tauri',
  other = 'other'
}

const buildMode = import.meta.env.VITE_APP_BUILD_MODE || BuildMode.other
const variant = import.meta.env.VITE_APP_VARIANT || ''

export const buildConfig = {
  buildMode,
  variant,
  tauri: buildMode === BuildMode.tauri,
  router: {
    base: import.meta.env.VITE_APP_PUBLIC_PATH || '/',
    mode: buildMode === BuildMode.browser_extension ? 'webHashHistory' : 'webHistory'
  },
  hints: {
    ssl: [BuildMode.other, BuildMode.docker, BuildMode.browser_extension].includes(buildMode),
    cors: [BuildMode.other, BuildMode.docker].includes(buildMode),
  },
  checkPredefinedClusters: buildMode === BuildMode.docker
}
