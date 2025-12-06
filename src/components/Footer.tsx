import ThemeSwitcher from './ThemeSwitcher'

export default function Footer() {
  return (
    <div className="border border-t border-dashed p-4">
      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>
    </div>
  )
}
