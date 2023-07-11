interface ImportMetaEnv {
  readonly VITE_APP_BUILD_MODE: BuildMode
  readonly VITE_APP_PUBLIC_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}