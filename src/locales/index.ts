/** Single locale for now; import { strings } from "@/locales" then e.g. strings.common.tryAgain. */
import type { LocaleStrings } from "./en";
import { en } from "./en";

export const strings: LocaleStrings = en;

export type { LocaleStrings } from "./en";
export { en } from "./en";
