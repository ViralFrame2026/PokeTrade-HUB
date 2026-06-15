import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketrade-hub.vercel.app";

  return ["", "/marketplace", "/publish", "/raffles", "/raffles/new", "/admin"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
