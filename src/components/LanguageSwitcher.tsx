import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { m } from '@/lang'

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
}

export default function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLanguage()

  const handleLanguageChange = () => {
    // Toggle between available languages
    const currentIndex = availableLocales.indexOf(locale)
    const nextIndex = (currentIndex + 1) % availableLocales.length
    setLocale(availableLocales[nextIndex])
  }

  return (
    <button
      onClick={handleLanguageChange}
      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
      title={m.language_switcher_label()}
    >
      <Globe size={16} />
      <span className="hidden sm:inline">{languageNames[locale]}</span>
    </button>
  )
}
