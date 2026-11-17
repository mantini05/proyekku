const { defineConfig } = require("vite");
const { handleSyncRequest } = require("./sync-api.cjs");

module.exports = defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  },
  plugins: [
    {
      name: "sawitscale-desktop-mobile-sync",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const port = server.config.server.port || 5173;
          if (handleSyncRequest(req, res, port)) {
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const port = server.config.preview.port || 4173;
          if (handleSyncRequest(req, res, port)) {
            return;
          }
          next();
        });
      },
    },
  ],
});
