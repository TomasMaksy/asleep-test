type RequiredTrackingEnv = {
  name: string;
  aliases?: readonly string[];
};

type EnvBag = Record<string, string | undefined>;

const REQUIRED_TRACKING_ENV: readonly RequiredTrackingEnv[] = [
  {
    name: "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN",
    aliases: ["NEXT_PUBLIC_POSTHOG_KEY"],
  },
  { name: "NEXT_PUBLIC_META_PIXEL_ID" },
  { name: "META_CONVERSIONS_API_TOKEN" },
  { name: "NEXT_PUBLIC_GA4_MEASUREMENT_ID" },
  { name: "GA4_MEASUREMENT_PROTOCOL_SECRET" },
];

function envValue(env: EnvBag, names: readonly string[]) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return "";
}

export function missingTrackingEnv(env: EnvBag = process.env) {
  return REQUIRED_TRACKING_ENV.flatMap((variable) => {
    const names = [variable.name, ...(variable.aliases ?? [])];
    return envValue(env, names) ? [] : [variable.name];
  });
}

export function assertTrackingEnvForBuild(env: EnvBag = process.env) {
  const missing = missingTrackingEnv(env);
  const productionNode = env.NODE_ENV === "production";
  const vercelProduction = env.VERCEL_ENV === "production";

  if (!productionNode) {
    if (missing.length > 0) {
      console.warn(
        `[tracking] Missing ${missing.join(", ")}. Providers without credentials stay off.`,
      );
    }
    return;
  }

  const problems: string[] = [];
  if (missing.length > 0) {
    problems.push(`missing required tracking env: ${missing.join(", ")}`);
  }
  if (vercelProduction && env.META_TEST_EVENT_CODE?.trim()) {
    problems.push("META_TEST_EVENT_CODE must be empty in Vercel production");
  }
  if (problems.length === 0) {
    return;
  }

  throw new Error(
    `[tracking] Production build blocked (${problems.join("; ")}). Set the values in Vercel and .env.local.`,
  );
}
