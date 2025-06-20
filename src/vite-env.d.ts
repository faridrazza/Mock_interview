/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HACKATHON_MODE: string
  readonly VITE_LAMBDA_BASE_URL: string
  readonly VITE_USE_LAMBDA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
