import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { ui as enUi, type UiDictionary } from "./en/ui";
import { ui as nlUi } from "./nl/ui";

/** Shared-UI dictionary for a locale. `en` is the canonical shape. */
export function uiFor(locale: Locale = DEFAULT_LOCALE): UiDictionary {
  return locale === "nl" ? nlUi : enUi;
}
