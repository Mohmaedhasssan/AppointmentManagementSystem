import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: Number(process.env.VITE_PORT ?? 5173),
        strictPort: false,
        // When tunneling (e.g. ngrok) set VITE_TUNNEL_HOST and optional VITE_HMR_PORT.
        allowedHosts: process.env.VITE_TUNNEL_HOST ? [process.env.VITE_TUNNEL_HOST] : [],
        hmr: process.env.VITE_TUNNEL_HOST
            ? {
                  host: process.env.VITE_TUNNEL_HOST,
                  protocol: 'wss',
                  port: Number(process.env.VITE_HMR_PORT ?? 443),
              }
            : {
                  host: 'localhost',
                  protocol: 'ws',
                  port: Number(process.env.VITE_PORT ?? 5173),
              },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
