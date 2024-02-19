/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_SOME_KEY: string
    readonly DB_PASSWORD: string
    readonly VITE_PROFILE_PAGE: string;
    readonly VITE_FOOTER_LINE1: string
    readonly VITE_FOOTER_LINE2: string
    readonly VITE_GIT_REPO: string
    // more env variables...
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}