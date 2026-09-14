#!/usr/bin/env bun

const port = process.env.PORT ?? "3000";
const host = await readBaseHost();

if (!host) {
  console.error(
    "Set NEXT_PUBLIC_BASE_HOST in .env.local to your reserved ngrok domain.",
  );
  process.exit(1);
}

const installed = Bun.spawnSync(["which", "ngrok"]);
if (installed.exitCode !== 0) {
  console.error(
    "ngrok not found. Install it first: brew install ngrok/ngrok/ngrok",
  );
  process.exit(1);
}

const child = Bun.spawn(["ngrok", "http", "--url", host, port], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

function stop() {
  child.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

process.exit((await child.exited) ?? 1);

async function readBaseHost() {
  const fromEnv = strip(process.env.NEXT_PUBLIC_BASE_HOST);
  if (fromEnv) {
    return fromEnv;
  }

  try {
    const text = await Bun.file(".env.local").text();
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      if (!trimmed.startsWith("NEXT_PUBLIC_BASE_HOST=")) {
        continue;
      }
      return strip(trimmed.slice("NEXT_PUBLIC_BASE_HOST=".length));
    }
  } catch {
    // .env.local is optional if the host is already in the environment.
  }

  return "";
}

function strip(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}
