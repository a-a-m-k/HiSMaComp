/**
 * Locale / localization entry point.
 *
 * For now we export a single locale (en). All user-facing strings should go through
 * this module so that adding i18n later (e.g. react-i18next) only requires:
 * - Installing the i18n library and loading translation files.
 * - Replacing `strings` with a hook or HOC that returns the active locale (e.g. useTranslation().t).
 * - Optionally passing locale from URL or user preference.
 *
 * Usage: import { strings } from "@/locales"; then strings.common.tryAgain, etc.
 */
import type { LocaleStrings } from "./en";
import { en } from "./en";

/** Currently active locale strings. Replace with useTranslation() or similar when adding i18n. */
export const strings: LocaleStrings = en;

export type { LocaleStrings } from "./en";
export { en } from "./en";
