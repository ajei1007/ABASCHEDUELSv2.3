import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Generate release name for Sentry
  const getReleasePrefix = (mode: string): string => {
    if (mode.startsWith('production')) return 'prod-';
    if (mode === 'staging') return 'staging-';
    if (mode === 'development') return '';
    return 'unknown-';
  };

  const isDevelopment = mode === 'development';
  const releasePrefix = getReleasePrefix(mode);
  const environment = env.REACT_APP_ENV || 'main';
  const version = env.npm_package_version || '1.0.0';
  const releaseName = `${releasePrefix}${environment}@${version}`;

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: {
          name: releaseName,
        },
        sourcemaps: {
          assets: [
            `${env.BUILD_PATH}/**/*.js`,
            `${env.BUILD_PATH}/**/*.js.map`,
          ],
          disable: isDevelopment, // Disable in development
          filesToDeleteAfterUpload: [
            '**/*.js.map', // Remove sourcemap files after upload
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
        components: fileURLToPath(new URL('./src/components', import.meta.url)),
        constants: fileURLToPath(new URL('./src/constants', import.meta.url)),
        helpers: fileURLToPath(new URL('./src/helpers', import.meta.url)),
        hooks: fileURLToPath(new URL('./src/hooks', import.meta.url)),
        pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
        router: fileURLToPath(new URL('./src/router', import.meta.url)),
        services: fileURLToPath(new URL('./src/services', import.meta.url)),
        store: fileURLToPath(new URL('./src/store', import.meta.url)),
        styles: fileURLToPath(new URL('./src/styles', import.meta.url)),
        types: fileURLToPath(new URL('./src/types', import.meta.url)),
        utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
        checkVersion: fileURLToPath(
          new URL('./src/checkVersion.ts', import.meta.url),
        ),
        config: fileURLToPath(new URL('./src/config.ts', import.meta.url)),
        features: fileURLToPath(new URL('./src/features.ts', import.meta.url)),

        '@': fileURLToPath(new URL('./src', import.meta.url)),
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    envPrefix: 'REACT_APP_', // Prefix for environment variables
    define: {
      'import.meta.env.REACT_APP_VERSION': JSON.stringify(version),
      'import.meta.env.REACT_APP_RELEASE_NAME': JSON.stringify(releaseName),
      'import.meta.env.REACT_APP_SENTRY_DSN': JSON.stringify(
        env.SENTRY_DSN || '',
      ),
    },
    server: {
      port: 3000, // Match CRA default port
      open: true,
    },
    build: {
      outDir: env.BUILD_PATH,
      emptyOutDir: true,
      sourcemap: !isDevelopment,
    },

    optimizeDeps: {
      // Force these packages to be pre-bundled
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-redux',
        '@reduxjs/toolkit',
        'moment',
        'lodash',
        'axios',
        '@mui/icons-material',
        '@mui/x-date-pickers',
      ],
    },

    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['slash-div', 'mixed-decls'],
        },
      },
    },
  };
});
