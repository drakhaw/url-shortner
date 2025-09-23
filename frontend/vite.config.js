import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import analyzer from 'rollup-plugin-analyzer'

// Plugin to optimize CSS loading by making it non-render-blocking
const cssPreloadPlugin = () => {
  return {
    name: 'css-preload',
    generateBundle(options, bundle) {
      // This will be handled by transformIndexHtml instead
    },
    transformIndexHtml(html) {
      // Replace stylesheet links with preload and add JS to switch them
      return html.replace(
        /<link rel="stylesheet"([^>]*)href="([^"]*\.css)"([^>]*)>/g,
        (match, beforeHref, href, afterHref) => {
          return `<link rel="preload" as="style"${beforeHref}href="${href}"${afterHref}onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet"${beforeHref}href="${href}"${afterHref}></noscript>`;
        }
      );
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    cssPreloadPlugin(),
    // Add bundle analyzer in production
    ...(process.env.ANALYZE_BUNDLE ? [analyzer({ summaryOnly: true, limit: 20 })] : [])
  ],
  build: {
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          charts: ['recharts'],
          utils: ['axios', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Set target to modern browsers for smaller bundle size
    target: 'es2020',
    // Optimize CSS
    cssMinify: true,
    cssCodeSplit: true,
    // Aggressive minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // More aggressive compression
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Enable tree-shaking for better performance
    modulePreload: {
      polyfill: false,
    },
  },
})
