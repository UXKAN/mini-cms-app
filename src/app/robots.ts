import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mosqon.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          // Op mosqon.com is "/" de marketingpagina (indexeren gewenst);
          // op app.mosqon.com sturen deze app-routes de bezoeker weg via
          // middleware. Ze staan hier zodat ze op geen enkel domein indexeren.
          "/dashboard",
          "/members",
          "/donations",
          "/toezeggingen",
          "/gift",
          "/imports",
          "/login",
          "/onboarding",
          "/ondernemers",
          "/evenementen",
          "/updates",
          "/theme-playground",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
