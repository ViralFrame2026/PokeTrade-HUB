import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://poketrade-hub.vercel.app";

  const routes = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/marketplace", priority: 0.95, changeFrequency: "daily" },
    { path: "/raffles", priority: 0.85, changeFrequency: "daily" },
    { path: "/publish", priority: 0.75, changeFrequency: "weekly" },
    { path: "/raffles/new", priority: 0.65, changeFrequency: "weekly" },
    { path: "/safety", priority: 0.7, changeFrequency: "monthly" },
    { path: "/rules", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.45, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.45, changeFrequency: "yearly" }
  ] satisfies Array<{
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    path: string;
    priority: number;
  }>;

  return routes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: new Date(),
    priority: route.priority,
    url: `${baseUrl}${route.path}`
  }));
}
