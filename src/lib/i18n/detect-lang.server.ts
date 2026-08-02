import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export type Lang = "fr" | "en";

const COOKIE_NAME = "tte-lang";

/**
 * Detects the visitor's preferred language on the server, so that SSR'd
 * <head> metadata (title / description / og tags) can be served in the
 * right language for search engines and social previews.
 *
 * Priority:
 * 1. Explicit choice stored in the `tte-lang` cookie (set when a visitor
 *    uses the on-site language toggle) — this always wins.
 * 2. The browser's `Accept-Language` header, which is what a crawler or a
 *    first-time visitor sends.
 * Defaults to French, since that's the site's primary language.
 */
export const detectLang = createServerFn({ method: "GET" }).handler(async (): Promise<Lang> => {
  const cookieHeader = getRequestHeader("cookie") ?? "";
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=(fr|en)`));
  if (cookieMatch) {
    return cookieMatch[1] as Lang;
  }

  const acceptLanguage = getRequestHeader("accept-language") ?? "";
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("en") ? "en" : "fr";
});

/**
 * Reads the language resolved by the root route's loader out of a route's
 * `head(ctx)` context, without every route needing its own loader.
 * `ctx.matches` always contains the root match first.
 */
export function langFromHeadCtx(ctx: { matches?: Array<{ loaderData?: unknown }> }): Lang {
  const rootLoaderData = ctx.matches?.[0]?.loaderData;
  return rootLoaderData === "en" ? "en" : "fr";
}
