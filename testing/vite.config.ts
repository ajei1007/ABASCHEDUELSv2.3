import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const { default: istanbul } = await import('vite-plugin-istanbul');

  return {
    plugins: [
      istanbul({
        include: ['../frontend/src/**/*'],
        exclude: ['node_modules/**', 'tests/**'],
        extension: ['.js', '.ts', '.vue', '.svelte'],
        requireEnv: true,
        cypress: false
      })
    ],
    build: { sourcemap: true }
  };
});
