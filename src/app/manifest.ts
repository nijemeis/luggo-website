import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luggo — see your bags come to you",
    short_name: "Luggo",
    description: "Bluetooth beacons for your luggage, and the free app that shows them coming to you at the belt.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
