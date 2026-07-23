import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

function firebaseMessagingSwDevPlugin() {
   return {
      name: "firebase-messaging-sw-dev",
      apply: "serve" as const,
      configureServer(server: any) {
         // Intercept requests to the service worker and rewrite to source file
         // Vite will handle the transform as a client-side module
         server.middlewares.use((req: any, _res: any, next: any) => {
            const url = String(req.url || "").split("?")[0];
            if (url === "/firebase-messaging-sw.js") {
               // Rewrite to source file - Vite will transform it as a client module
               req.url = "/src/firebase-messaging-sw.js";
            }
            next();
         });
      },
   };
}

function staticAssetsCachePlugin() {
   return {
      name: "static-assets-cache",
      apply: "serve" as const,
      configureServer(server: any) {
         server.middlewares.use((req: any, res: any, next: any) => {
            const url = String(req.url || "").split("?")[0];
            // Cache images from /icons folder for 1 year (immutable)
            if (url.startsWith("/icons/") && /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url)) {
               res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
            next();
         });
      },
   };
}

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss(), firebaseMessagingSwDevPlugin(), staticAssetsCachePlugin()],
   optimizeDeps: {
      exclude: ["lucide-react"],
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
   build: {
      rollupOptions: {
         input: {
            main: path.resolve(__dirname, "index.html"),
            "firebase-messaging-sw": path.resolve(
               __dirname,
               "src/firebase-messaging-sw.js"
            ),
         },
         output: {
            entryFileNames: (chunkInfo) => {
               if (chunkInfo.name === "firebase-messaging-sw") {
                  return "firebase-messaging-sw.js";
               }
               return "assets/[name]-[hash].js";
            },
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash][extname]",
         },
      },
   },
});
