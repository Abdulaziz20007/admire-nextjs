import { Language } from "@/contexts/LanguageContext";

/**
 * Returns the localized text based on the current language
 * @param uzText Uzbek text
 * @param enText English text
 * @param language Current language
 * @returns Localized text
 */
export function getLocalizedText(
  uzText: string | undefined,
  enText: string | undefined,
  language: Language
): string {
  if (language === "uz") {
    return uzText || enText || "";
  }
  return enText || uzText || "";
}
