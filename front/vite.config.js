
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {

        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                ciudadanos: resolve(__dirname, "ciudadanos.html"),
                /*  contact: resolve(__dirname, "contact.html"), */
            },
        },
    },

    server: {
        port: 5173,
    },

    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    "import",
                    "mixed-decls",
                    "color-functions",
                    "global-builtin",
                ],
            },
        },
    },
});