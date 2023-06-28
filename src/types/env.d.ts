interface ImportMetaEnv {
  readonly VITE_APP_BUILD_MODE: BuildMode
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}