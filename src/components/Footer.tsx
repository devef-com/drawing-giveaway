import { Link } from '@tanstack/react-router'
import ThemeSwitcher from './ThemeSwitcher'

export default function Footer() {
  return (
    <div className="border border-t border-dashed p-3">
      <div className="grid grid-cols-2 mx-auto max-w-7xl">
        <div className="pt-2">
          <Link
            to="/support"
            className="text-sm text-muted-foreground hover:underline"
          >
            Support
          </Link>
        </div>
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  )
}
