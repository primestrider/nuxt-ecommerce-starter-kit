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
