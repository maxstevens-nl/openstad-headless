/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_PROJECT_ID: string;
	readonly VITE_RESOURCE_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
