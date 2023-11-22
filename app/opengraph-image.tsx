import { ImageResponse } from "next/og";
import { default as ImageComponent } from "next/image";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Homepage image";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    <ImageComponent src="/homepageView-min.png" alt="Homepage image" />
  );
}
