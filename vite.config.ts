import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // GEMINI_API_KEY removed from client bundle for security (GDPR/security fix)
    // Use server-side Supabase Edge Functions for AI features instead
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['motion/react', 'lucide-react'],
            supabase: ['@supabase/supabase-js'],
            admin: [
              './src/pages/admin/AdminDashboard',
              './src/pages/admin/AdminClinics',
              './src/pages/admin/AdminBookings',
              './src/pages/admin/AdminLandingPages',
              './src/pages/admin/AdminAnalytics',
              './src/pages/admin/AdminUsers',
              './src/pages/admin/AdminTreatments',
              './src/pages/admin/AdminPayments',
              './src/pages/admin/AdminSettings',
            ],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
