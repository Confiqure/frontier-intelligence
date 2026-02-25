import { PROVIDER_SVGS } from "@/lib/providers";

const svgs: Record<string, string> = PROVIDER_SVGS;

const svgImageCache: Record<string, HTMLImageElement | "circle"> = {};

export function getSvgImage(
  author: string | undefined,
  color: string
): HTMLImageElement | "circle" {
  if (!author || typeof window === "undefined") return "circle";

  const cacheKey = `${author}-${color}`;
  if (svgImageCache[cacheKey] !== undefined) return svgImageCache[cacheKey];

  const svgString = svgs[author];

  if (!svgString) {
    svgImageCache[cacheKey] = "circle";
    return "circle";
  }

  const processedSvg = svgString.replace(/currentColor/g, color);

  const img = new Image();
  img.width = 20;
  img.height = 20;

  const blob = new Blob([processedSvg], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  img.onload = () => URL.revokeObjectURL(url);
  img.src = url;

  svgImageCache[cacheKey] = img;
  return img;
}
