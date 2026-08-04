import { cookies } from "next/headers";
import type { Locale } from "./dictionary";

const LOCALE_COOKIE = "locale";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}
