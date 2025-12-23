export default defineNuxtConfig({
  ssr: false,
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },
  devtools: { enabled: true },
  ignore: ["temp/**", "public/temp/**"],

  nitro: {
    preset: "node-server",
    sourceMap: true, // Sempre attivo per debug
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    public: {},
  },

  modules: ["@nuxt/fonts", "nuxt-quasar-ui", "@pinia/nuxt", "pinia-plugin-persistedstate"],

  fonts: {
    families: [
      { name: "M PLUS Rounded 1c", provider: "google", weights: [400, 500, 700] },
      { name: "Noto Sans JP", provider: "google", weights: [400, 500, 700] },
    ],
  },

  css: [
    "quasar/src/css/index.sass",
    "@quasar/extras/material-icons/material-icons.css",
    "@/assets/styles/app.scss",
  ],

  quasar: {
    sassVariables: "@/assets/styles/quasar.variables.scss",
    plugins: ["Dialog", "Notify", "Dark", "Loading"],
    extras: { fontIcons: ["material-icons"] },
  },

  build: {
    transpile: ["quasar", "@quasar/extras"],
  },

  vite: {
    resolve: {
      dedupe: ["vue", "quasar", "@quasar/extras"],
    },

    ssr: {
      noExternal: ["quasar", "@quasar/extras"],
    },

    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // oppure 'modern'
          silenceDeprecations: ['legacy-js-api', 'import']
        },
        sass: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      }
    },

    server: {
      fs: {
        strict: false,
      },
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          "**/node_modules/**",
          "**/.nuxt/**",
          "**/.output/**",
          "temp/**",
          "**/dist/**",
          "**/.git/**",
          '**/public/repo/kanji/**'
        ],
      },
      hmr: {
        overlay: true,
        clientPort: undefined,
        timeout: 10000, 
      },
      optimizeDeps: {
        include: ["vue", "vue-router", "quasar", "@quasar/extras"],
        exclude: ["@nuxt/kit"],
        holdUntilCrawlEnd: false,
      },
    },

    build: {
      sourcemap: true,
    },
  },

  sourcemap: {
    server: true,
    client: true,
  },

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        }
      ],
      script: [
      ],
    },
  },
});