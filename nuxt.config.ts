const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://example.com";
const siteName =
  process.env.NUXT_PUBLIC_SITE_NAME || "Etalase";

// Routes exist unprefixed (default locale "id") and under "/en".
const localized = (path: string) => [path, `/en${path === "/" ? "" : path}`];

// Pages that render per-visitor state (session, cart, wishlist) are client-rendered
// so cached HTML never contains one visitor's data, and are kept out of search indexes.
const privatePages = ["/cart", "/checkout", "/checkout/**", "/account", "/wishlist"].flatMap(localized);
const authPages = ["/auth/login", "/auth/register"].flatMap(localized);

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
    // Upstream commerce API. Swap for your own backend; only server/ talks to it.
    dummyjsonUrl: "https://dummyjson.com",
    public: {
      currency: "USD",
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
    domains: ["cdn.dummyjson.com", "dummyjson.com"],
  },

  sitemap: {
    autoLastmod: true,
    exclude: [...privatePages, ...authPages],
  },

  nitro: {
    compressPublicAssets: true,
    // Product images are remote and optimised on demand; don't try to prerender them.
    prerender: { ignore: ["/_ipx"] },
  },

  routeRules: {
    ...Object.fromEntries(localized("/").map((p) => [p, { prerender: true }])),
    ...Object.fromEntries(
      ["/products", "/products/**"].flatMap(localized).map((p) => [p, { swr: 3600 }]),
    ),
    ...Object.fromEntries(privatePages.map((p) => [p, { ssr: false, robots: false }])),
    ...Object.fromEntries(authPages.map((p) => [p, { robots: false }])),

    // Image optimisation requests are numerous per page; don't let them drain the
    // global rate limit. Auth endpoints get a much tighter one.
    "/_ipx/**": { security: { rateLimiter: false } },
    "/api/auth/**": {
      security: { rateLimiter: { tokensPerInterval: 10, interval: 60_000 } },
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
    defaultLocale: "id",
    locales: [
      { code: "id", language: "id-ID", name: "Bahasa Indonesia", file: "id.json" },
      { code: "en", language: "en-US", name: "English", file: "en.json" },
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
