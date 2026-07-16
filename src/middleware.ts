import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing: één codebase bedient twee domeinen.
 *
 *   mosqon.com       → de marketingsite op de kale root ("/").
 *   app.mosqon.com   → de applicatie (dashboard, leden, login, ...).
 *
 * De marketingpagina's leven in de bestandsstructuur op /home, /privacy en
 * /voorwaarden; op het marketingdomein tonen we /home als "/" via een rewrite,
 * zodat de bezoeker een schone URL zonder /home ziet.
 *
 * Hosts zijn instelbaar via env-vars (zie docs/product/integrations.md); de
 * defaults kloppen voor productie, en localhost/preview gedraagt zich als het
 * marketingdomein zodat de kale-root-URL lokaal net zo werkt als live.
 */

const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "app.mosqon.com";
const MARKETING_HOST = process.env.NEXT_PUBLIC_MARKETING_HOST ?? "mosqon.com";

// Paginaroutes van de applicatie. Alleen déze worden op het marketingdomein
// doorgestuurd naar de app; assets (/_next, /images, *.ico, ...) niet.
const APP_ROUTES = [
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
];

// Marketingpagina's die op het app-domein juist teruggestuurd worden.
const MARKETING_PAGES = ["/home", "/privacy", "/voorwaarden"];

function isAppRoute(path: string) {
  return APP_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").split(":")[0];

  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    process.env.VERCEL_ENV === "preview";
  const isAppHost = host === APP_HOST;
  const isMarketingHost =
    host === MARKETING_HOST || host === `www.${MARKETING_HOST}`;

  // App-domein: marketingpagina's horen op het marketingdomein thuis.
  if (isAppHost) {
    if (pathname === "/home") {
      return NextResponse.redirect(`https://${MARKETING_HOST}/`);
    }
    if (MARKETING_PAGES.includes(pathname)) {
      return NextResponse.redirect(`https://${MARKETING_HOST}${pathname}`);
    }
    return NextResponse.next();
  }

  // Marketingdomein: app-routes doorsturen naar het app-domein.
  if (isMarketingHost) {
    if (isAppRoute(pathname)) {
      return NextResponse.redirect(`https://${APP_HOST}${pathname}${search}`);
    }
    if (pathname === "/home") {
      return NextResponse.redirect(new URL(`/${search}`, request.url));
    }
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Localhost / preview: marketing op de kale root, app-routes gewoon lokaal.
  if (isLocal) {
    if (pathname === "/home") {
      return NextResponse.redirect(new URL(`/${search}`, request.url));
    }
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Alles behalve Next-interne assets, api-routes en bestanden met een punt
  // (robots.txt, sitemap.xml, favicon.ico, /images/foto.jpg, ...).
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
