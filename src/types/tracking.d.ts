declare global {
  type MetaPixelFunction = {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[][];
    loaded: boolean;
    version: string;
    push: MetaPixelFunction;
  };

  type GoogleTagFunction = (...args: unknown[]) => void;

  interface Window {
    _fbq?: MetaPixelFunction;
    fbq?: MetaPixelFunction;
    dataLayer?: unknown[];
    gtag?: GoogleTagFunction;
  }
}

export {};
