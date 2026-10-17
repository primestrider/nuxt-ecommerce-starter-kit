const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://example.com";
const siteName =
  process.env.NUXT_PUBLIC_SITE_NAME || "Nuxt E-Commerce Starter Kit";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  ssr: true,

  app: {
    head: {
      titleTemplate: `${siteName} | %s`,
      link: [{ rel: "icon", href: "/favicon.ico" }],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl,
      siteName,
    },
  },

  site: {
    url: siteUrl,
    name: siteName,
  },

  image: {
    format: ["webp", "avif"],
  },

  sitemap: {
    autoLastmod: true,
  },

  nitro: {
    compressPublicAssets: true,
  },

  routeRules: {
    "/": {
      prerender: true,
    },

    "/products/**": {
      swr: 3600,
    },

    "/categories/**": {
      swr: 3600,
    },
  },

  $production: {
    scripts: {
      // registry: {
      //   cloudflareWebAnalytics: {
      //     token: "",
      //     trigger: "",
      //   },
      //   googleAnalytics: {
      //     id: process.env.NUXT_PUBLIC_GA_ID,
      //     trigger: "manual",
      //   },
      // },
    },

    // Strip console/debugger from client bundles via Vite 8's oxc minifier
    // (nuxt-security's removeLoggers sets esbuild options that Vite 8 ignores).
    vite: {
      $client: {
        build: {
          rolldownOptions: {
            output: {
              minify: {
                compress: { dropConsole: true, dropDebugger: true },
                mangle: true,
                codegen: true,
              },
            },
          },
        },
      },
    },
  },

  security: {
    removeLoggers: false,
  },

  i18n: {
    defaultLocale: "en",
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.json" },
      { code: "id", language: "id-ID", name: "Bahasa Indonesia", file: "id.json" },
    ],
  },

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  modules: [
    "motion-v/nuxt",
    "@nuxt/a11y",
    "@nuxt/test-utils",
    "@nuxt/image",
    "@nuxt/hints",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@nuxtjs/seo",
    "@pinia/nuxt",
    "nuxt-security",
    "@nuxt/scripts",
  ],
});
