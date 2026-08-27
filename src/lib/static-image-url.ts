/** Bump when hero/product static assets change to bust browser cache. */
export const STATIC_IMAGE_CACHE_VERSION = "5";

export function staticImageUrl(path: string) {
  return `${path}?v=${STATIC_IMAGE_CACHE_VERSION}`;
}
