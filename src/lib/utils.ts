import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const getTimeRemainingText = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days}d ${hours}H`
  }
  return `${hours}H`
}

export const formatDateGiway = (dateString: string) => {
  // Parse the UTC timestamp and display in UTC to match stored time
  const date = new Date(dateString)
  const now = new Date()

  // Compare dates in UTC
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const yesterdayUTC = todayUTC - 86400000 // 24 hours in ms
  const participantDayUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })

  if (participantDayUTC === todayUTC) {
    return `Today ${time}`
  } else if (participantDayUTC === yesterdayUTC) {
    return `Yesterday ${time}`
  } else {
    const monthDay = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      timeZone: 'UTC',
    })
    return `${monthDay} ${time}`
  }
}
