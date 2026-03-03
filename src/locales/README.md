# Locales / localization

User-facing strings are centralized in `en.ts` and consumed via `import { strings } from "@/locales"`. This keeps the app ready for i18n without adding a library until needed.

## Current usage

- **`src/locales/en.ts`** – English strings grouped by area (common, errors, loading, map, timeline, legend, screenshot, dev).
- **`src/locales/index.ts`** – Exports `strings` (currently the `en` object) and the `LocaleStrings` type.

Components use `strings.common.tryAgain`, `strings.errors.dataLoadingError`, etc., instead of hardcoded copy.

## Adding full i18n later

When you want multiple languages or runtime locale switching:

1. **Option A: react-i18next**
   - Install: `npm i i18next react-i18next`
   - Add translation files (e.g. `locales/en.json`, `locales/de.json`) or keep the TS structure.
   - In your root (e.g. `main.tsx` or `App.tsx`): `import i18n from 'i18next'; import { initReactI18next } from 'react-i18next';` and init with `resources: { en: { translation: en } }`.
   - Replace `strings` with `const { t } = useTranslation();` and use `t('errors.dataLoadingError')` (or keep nested keys: `t('errors.dataLoadingError')` with a flat JSON, or keep nested and use `t('errors', { returnObjects: true })`).
   - Keep `en.ts` as the source and generate JSON from it if you prefer JSON for translators.

2. **Option B: Minimal custom**
   - Store `currentLocale` in context or URL and load `locales/[locale].ts`.
   - Export `strings` from a hook that reads `currentLocale` and returns the right object. No new deps.

3. **Lazy loading**
   - For many languages, dynamic import: `const strings = await import(\`@/locales/${locale}\`).then(m => m[locale]);` and expose via context so only the active locale is loaded.

## Adding a new string

1. Add the key and English text to `en.ts` in the right group.
2. In the component, `import { strings } from "@/locales"` and use `strings.group.key`.
3. When you add a second language, add the same key to the other locale file.
