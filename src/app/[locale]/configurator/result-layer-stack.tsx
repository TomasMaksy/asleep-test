import type { Firmness } from "@/lib/configurator";
import type { ConfiguratorLayerId } from "@/lib/configurator-layer-stack";
import { firmnessLayerStack } from "@/lib/configurator-layer-stack";
import { staticImageUrl } from "@/lib/static-image-url";

type ResultLayerStackProps = {
  firmness: Firmness;
  labels: Record<ConfiguratorLayerId, string>;
  heading?: string;
};

export function ResultLayerStack({
  firmness,
  labels,
  heading,
}: ResultLayerStackProps) {
  const layers = firmnessLayerStack(firmness);

  return (
    <div className="mt-6">
      {heading ? (
        <p className="mb-3 font-bold text-base text-brand-dark lg:text-lg">
          {heading}
        </p>
      ) : null}
      <ul className="flex flex-col gap-2.5">
        {layers.map((layer) => (
          <li
            className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center gap-3 sm:gap-5"
            key={layer.id}
          >
            <div className="overflow-hidden">
              {/* biome-ignore lint/performance/noImgElement: alpha cutouts; next/image flattens transparency */}
              <img
                alt=""
                className="h-auto w-[108%] max-w-none -translate-x-[4.5%] select-none object-contain"
                decoding="async"
                draggable={false}
                height={layer.height}
                src={staticImageUrl(layer.src)}
                width={layer.width}
              />
            </div>
            <p className="font-bold text-base text-brand-dark leading-snug lg:text-lg">
              {labels[layer.id]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
