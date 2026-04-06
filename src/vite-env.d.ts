/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MEDIAPIPE_MODEL_ASSET_URL?: string;
  readonly VITE_MEDIAPIPE_WASM_ROOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
