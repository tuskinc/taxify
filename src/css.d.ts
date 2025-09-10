/// <reference types="vite/client" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add this to handle @tailwind directives
declare module 'tailwindcss' {
  interface Config {
    content: string[];
    theme: Record<string, unknown>;
    plugins: unknown[];
  }
}

declare module 'tailwindcss/plugin' {
  import { PluginCreator } from 'postcss';
  interface Plugin {
    postcss: PluginCreator<unknown>;
  }
  const plugin: Plugin;
  export default plugin;
}

declare module 'tailwindcss/lib/util/plugin' {
  const plugin: (options: unknown) => void;
  export default plugin;
}

declare module 'tailwindcss/lib/lib/expandApplyAtRules' {
  export default function expandApplyAtRules(options: unknown): void;
}

declare module 'tailwindcss/lib/lib/generateRules' {
  export default function generateRules(options: unknown): void;
}

declare module 'tailwindcss/lib/lib/setupContextUtils' {
  export function createContext(options: unknown): unknown;
}

declare module 'tailwindcss/resolveConfig' {
  export default function resolveConfig(config: unknown): unknown;
}

// Add this to handle CSS variables
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Handle PostCSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add this to handle process.env
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly CLAUDE_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
