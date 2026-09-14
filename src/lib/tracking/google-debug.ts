type GoogleDebugEnv = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_VERCEL_ENV?: string;
};

export function isGoogleDebugMode(
  env: GoogleDebugEnv = {
    // Direct process.env.* reads so Next.js can inline public values
    // into the client bundle. Passing `process.env` as an object does not.
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
) {
  const vercelEnv = env.NEXT_PUBLIC_VERCEL_ENV ?? env.VERCEL_ENV;
  if (vercelEnv) {
    return vercelEnv !== "production";
  }
  return env.NODE_ENV !== "production";
}
