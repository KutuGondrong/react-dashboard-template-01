import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const OG_TITLE = 'Teristimewa Dashboard';
const OG_DESCRIPTION = 'Admin dashboard for daily operations';

function readExternalLinks(root: string): { previewUrl?: string } {
  const filePath = path.join(root, 'src/config/external-links.json');
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as { previewUrl?: string };
  } catch {
    return {};
  }
}

function buildOgMetaTags(options: {
  siteUrl: string;
  basePath: string;
  title: string;
  description: string;
}): string {
  const appRoot = options.siteUrl.replace(/\/$/, '');
  const base = options.basePath === '/' ? '' : options.basePath.replace(/\/$/, '');

  const imageUrl = appRoot
    ? `${appRoot}/og-image.jpg`
    : base
      ? `${base}/og-image.jpg`
      : '/og-image.jpg';
  const pageUrl = appRoot ? `${appRoot}/` : undefined;

  return [
    `<meta name="description" content="${options.description}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${options.title}" />`,
    `<meta property="og:description" content="${options.description}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Teristimewa Dashboard preview" />',
    ...(pageUrl ? [`<meta property="og:url" content="${pageUrl}" />`] : []),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${options.title}" />`,
    `<meta name="twitter:description" content="${options.description}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  ].join('\n    ');
}

function ogMetaPlugin(options: {
  siteUrl: string;
  basePath: string;
  title: string;
  description: string;
}): Plugin {
  const tags = buildOgMetaTags(options);
  return {
    name: 'og-meta',
    transformIndexHtml(html) {
      if (html.includes('<!-- og-meta -->')) {
        return html.replace('<!-- og-meta -->', tags);
      }
      return html.replace('</head>', `    ${tags}\n  </head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root, '');
  const rawBase = env.VITE_BASE_PATH || '/';
  const base =
    rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const externalLinks = readExternalLinks(root);
  const siteUrl = (env.VITE_OG_SITE_URL || externalLinks.previewUrl || '').replace(/\/$/, '');

  return {
    plugins: [
      react(),
      ogMetaPlugin({
        siteUrl,
        basePath: base,
        title: OG_TITLE,
        description: OG_DESCRIPTION,
      }),
    ],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            axios: ['axios'],
          },
        },
      },
    },
  };
});
