import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketrade-hub.vercel.app";

  return ["", "/publish", "/raffles/new", "/admin"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
