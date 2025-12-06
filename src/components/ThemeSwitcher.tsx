import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-[88px] h-8" /> // Placeholder to prevent layout shift
  }

  const themes = [
    { name: 'System', value: 'system', icon: Monitor },
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
  ]

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-1">
      {themes.map(({ name, value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
          aria-label={`Switch to ${name} theme`}
          title={name}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}
