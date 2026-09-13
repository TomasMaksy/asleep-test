/** Dev-only. Bump when replacing files under /public/images while `bun dev` is running. */
export const STATIC_IMAGE_CACHE_VERSION = "29";

export function staticImageUrl(path: string) {
  if (process.env.NODE_ENV === "production") {
    return path;
  }

  return `${path}?v=${STATIC_IMAGE_CACHE_VERSION}`;
}
