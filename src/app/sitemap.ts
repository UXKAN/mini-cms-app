import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mosqon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // /privacy en /voorwaarden zijn nog noindex-placeholders; toevoegen zodra de
  // definitieve juridische teksten er staan.
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
