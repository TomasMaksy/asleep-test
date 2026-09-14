import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const posthogHost = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
).replace(/\/$/, "");
const posthogAssetsHost = posthogHost
  .replace("://eu.i.", "://eu-assets.i.")
  .replace("://us.i.", "://us-assets.i.");

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  experimental: {
    globalNotFound: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        pathname: "/api/v1/image/**",
      },
      {
        protocol: "https",
        hostname: "s3.mattsleeps.com",
        pathname: "/**",
      },
    ],
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
  },
  async rewrites() {
    // beforeFiles so next-intl's [locale] app route cannot 404 /ingest
    // (or a locale-prefixed /lt/ingest leftover) before the proxy runs.
    return {
      beforeFiles: [
        {
          source: "/ingest/static/:path*",
          destination: `${posthogAssetsHost}/static/:path*`,
        },
        {
          source: "/ingest/array/:path*",
          destination: `${posthogAssetsHost}/array/:path*`,
        },
        {
          source: "/ingest/:path*",
          destination: `${posthogHost}/:path*`,
        },
        {
          source: "/:locale(lt|en)/ingest/static/:path*",
          destination: `${posthogAssetsHost}/static/:path*`,
        },
        {
          source: "/:locale(lt|en)/ingest/array/:path*",
          destination: `${posthogAssetsHost}/array/:path*`,
        },
        {
          source: "/:locale(lt|en)/ingest/:path*",
          destination: `${posthogHost}/:path*`,
        },
      ],
    };
  },
  async headers() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
