import { Link } from '@tanstack/react-router'
import ThemeSwitcher from './ThemeSwitcher'
import { m } from '@/lang'
import { useLanguage } from '@/lib/i18n'

export default function Footer() {
  const { locale } = useLanguage()

  return (
    <div className="border border-t border-dashed p-3">
      <div className="grid grid-cols-2 mx-auto max-w-7xl">
        <div className="pt-2">
          <Link
            to="/support"
            className="text-sm text-muted-foreground hover:underline"
          >
            {m.common_support()}
          </Link>
        </div>
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  )
}
