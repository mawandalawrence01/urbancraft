import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UrbanCraft Furniture Workshop",
    short_name: "UrbanCraft",
    description:
      "Sofas, beds, wall units and dining sets made to order in Kampala. Pay by mobile money, delivered across Uganda.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#17150f",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
