import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { assertTrackingEnvForBuild } from "./src/lib/tracking/required-env";

assertTrackingEnvForBuild();

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const posthogHost = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"
).replace(/\/$/, "");
const posthogAssetsHost = posthogHost
  .replace("://eu.i.", "://eu-assets.i.")
  .replace("://us.i.", "://us-assets.i.");

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  // ngrok tunnels (HMR /_next/*); wildcard so rotating free subdomains work
  allowedDevOrigins: ["*.ngrok-free.dev"],
  experimental: {
    globalNotFound: true,
    // lucide-react is optimized by default; motion is not.
    // https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports
    optimizePackageImports: ["motion"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    qualities: [75, 80, 90],
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
  async redirects() {
    return [
      // Collapse www + legacy /lt into one hop (avoids
      // www…/lt/… → apex…/lt/… → apex…/…).
      {
        source: "/lt",
        has: [{ type: "host", value: "www.asleep.lt" }],
        destination: "https://asleep.lt/",
        permanent: true,
      },
      {
        source: "/lt/:path((?!ingest(?:/|$)).*)",
        has: [{ type: "host", value: "www.asleep.lt" }],
        destination: "https://asleep.lt/:path",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.asleep.lt" }],
        destination: "https://asleep.lt/:path*",
        permanent: true,
      },
      {
        source: "/lt",
        destination: "/",
        permanent: true,
      },
      // Exclude /lt/ingest — next.config redirects run before Proxy/rewrites.
      {
        source: "/lt/:path((?!ingest(?:/|$)).*)",
        destination: "/:path",
        permanent: true,
      },
    ];
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
