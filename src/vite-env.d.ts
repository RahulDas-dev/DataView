/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_PROFILE_PAGE: string;
  readonly VITE_FOOTER_LINE1: string;
  readonly VITE_FOOTER_LINE2: string;
  readonly VITE_GIT_REPO: string;
  readonly VITE_ROWS_PER_PAGE: string;
  readonly VITE_MAX_COLS_TO_SHOW: string;
  readonly VITE_COLUMNS_WIDTH: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
