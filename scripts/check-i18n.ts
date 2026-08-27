/**
 * Compare EN/LT message files: same keys, same array lengths, same ICU placeholders.
 * Also flags leftover lorem ipsum and source-site "Matt" branding.
 *
 * Usage: bun run i18n:check
 */

const LOCALES = ["en", "lt"] as const;
const FILES = [
  "messages/{locale}.json",
  "messages/{locale}/home.json",
  "messages/{locale}/product-original.json",
  "messages/{locale}/reviews-page.json",
] as const;

const ICU_RE = /\{[a-zA-Z0-9_]+\}/g;
const LOREM_RE = /\b(lorem|ipsum|consectetur|adipiscing|tempor incididunt)\b/i;
const MATT_BRAND_RE = /\bMatt\b/;

type Issue = {
  level: "error" | "warn";
  file: string;
  path: string;
  message: string;
};

const issues: Issue[] = [];

function load(file: string) {
  return Bun.file(file).json() as Promise<unknown>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function walk(file: string, en: unknown, lt: unknown, path: string) {
  if (isPlainObject(en) || isPlainObject(lt)) {
    if (!isPlainObject(en) || !isPlainObject(lt)) {
      issues.push({
        level: "error",
        file,
        path,
        message: `type mismatch: EN is ${typeName(en)}, LT is ${typeName(lt)}`,
      });
      return;
    }
    const enKeys = Object.keys(en);
    const ltKeys = Object.keys(lt);
    for (const key of enKeys) {
      if (!(key in lt)) {
        issues.push({
          level: "error",
          file,
          path: join(path, key),
          message: "missing in LT",
        });
      }
    }
    for (const key of ltKeys) {
      if (!(key in en)) {
        issues.push({
          level: "error",
          file,
          path: join(path, key),
          message: "extra in LT (not in EN)",
        });
      }
    }
    for (const key of enKeys) {
      if (key in lt) walk(file, en[key], lt[key], join(path, key));
    }
    return;
  }

  if (Array.isArray(en) || Array.isArray(lt)) {
    if (!Array.isArray(en) || !Array.isArray(lt)) {
      issues.push({
        level: "error",
        file,
        path,
        message: `type mismatch: EN is ${typeName(en)}, LT is ${typeName(lt)}`,
      });
      return;
    }
    if (en.length !== lt.length) {
      issues.push({
        level: "error",
        file,
        path,
        message: `array length EN=${en.length} LT=${lt.length}`,
      });
    }
    const len = Math.min(en.length, lt.length);
    for (let i = 0; i < len; i++) {
      walk(file, en[i], lt[i], `${path}[${i}]`);
    }
    return;
  }

  if (typeof en === "string" && typeof lt === "string") {
    const enIcu = (en.match(ICU_RE) ?? []).sort().join(" ");
    const ltIcu = (lt.match(ICU_RE) ?? []).sort().join(" ");
    if (enIcu !== ltIcu) {
      issues.push({
        level: "error",
        file,
        path,
        message: `ICU placeholders differ: EN "${enIcu || "(none)"}" vs LT "${ltIcu || "(none)"}"`,
      });
    }
    for (const [locale, value] of [
      ["EN", en],
      ["LT", lt],
    ] as const) {
      if (LOREM_RE.test(value)) {
        issues.push({
          level: "warn",
          file,
          path,
          message: `${locale} still has lorem ipsum`,
        });
      }
      if (MATT_BRAND_RE.test(value)) {
        issues.push({
          level: "warn",
          file,
          path,
          message: `${locale} still says "Matt" (source-site leftover — should be Asleep)`,
        });
      }
    }
  }
}

function join(path: string, key: string) {
  return path ? `${path}.${key}` : key;
}

function typeName(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

for (const pattern of FILES) {
  const enFile = pattern.replace("{locale}", "en");
  const ltFile = pattern.replace("{locale}", "lt");
  const [en, lt] = await Promise.all([load(enFile), load(ltFile)]);
  walk(pattern, en, lt, "");
}

const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");

function print(list: Issue[], label: string) {
  if (list.length === 0) return;
  console.log(`\n${label} (${list.length})`);
  for (const issue of list) {
    console.log(`  ${issue.file}  ${issue.path || "(root)"}  ${issue.message}`);
  }
}

print(errors, "ERRORS");
print(warns, "WARNINGS");

if (errors.length === 0 && warns.length === 0) {
  console.log(`OK — ${FILES.length} files × ${LOCALES.length} locales`);
} else {
  console.log(
    `\n${errors.length} error(s), ${warns.length} warning(s). See COPY.md.`,
  );
}

if (errors.length > 0) process.exit(1);
