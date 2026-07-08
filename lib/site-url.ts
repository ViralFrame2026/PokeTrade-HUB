const DEFAULT_SITE_URL = "https://nexotcg.vercel.app";

export function siteUrl(path = "") {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";

  return `${baseUrl}${normalizedPath}`;
}

export function siteUrlObject(path = "") {
  return new URL(siteUrl(path));
}
