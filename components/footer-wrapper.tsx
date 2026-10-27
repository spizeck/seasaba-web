import { Footer } from "@/components/footer";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";

export function FooterWrapper({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  return <Footer locale={locale} />;
}
