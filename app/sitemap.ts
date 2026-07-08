import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/site-url";

type PublicRoute = {
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified?: string | null;
  path: string;
  priority: number;
};

async function getDynamicRoutes(): Promise<PublicRoute[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );

  const [listingsResult, rafflesResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, updated_at, approved_at")
      .eq("moderation_status", "approved")
      .eq("status", "active")
      .order("approved_at", { ascending: false })
      .limit(500),
    supabase
      .from("raffles")
      .select("id, updated_at, created_at")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(200)
  ]);

  const listingRoutes = (listingsResult.data ?? []).map((listing) => ({
    changeFrequency: "daily" as const,
    lastModified: listing.updated_at ?? listing.approved_at,
    path: `/listings/${listing.id}`,
    priority: 0.8
  }));

  const raffleRoutes = (rafflesResult.data ?? []).map((raffle) => ({
    changeFrequency: "daily" as const,
    lastModified: raffle.updated_at ?? raffle.created_at,
    path: `/raffles/${raffle.id}`,
    priority: 0.72
  }));

  return [...listingRoutes, ...raffleRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: PublicRoute[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/marketplace", priority: 0.95, changeFrequency: "daily" },
    { path: "/raffles", priority: 0.85, changeFrequency: "daily" },
    { path: "/publish", priority: 0.75, changeFrequency: "weekly" },
    { path: "/raffles/new", priority: 0.65, changeFrequency: "weekly" },
    { path: "/safety", priority: 0.7, changeFrequency: "monthly" },
    { path: "/rules", priority: 0.7, changeFrequency: "monthly" },
    { path: "/support", priority: 0.65, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.45, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.45, changeFrequency: "yearly" }
  ] satisfies PublicRoute[];

  const dynamicRoutes = await getDynamicRoutes().catch(() => []);
  const routes = [...staticRoutes, ...dynamicRoutes];

  return routes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: route.lastModified ? new Date(route.lastModified) : new Date(),
    priority: route.priority,
    url: siteUrl(route.path)
  }));
}
