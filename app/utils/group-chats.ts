// Utilities to group chat items by recency buckets for sidebar navigation
import { isToday, isYesterday, subMonths } from 'date-fns'

interface Chat {
  id: string
  label: string
  icon: string
  createdAt: string
}

// Returns computed groups of chats organized by Today/Yesterday/Last week/Last month/Older
export default function (chats: Ref<Chat[] | undefined | null>) {
  const groups = computed(() => {
    // Buckets to accumulate chats by relative date
    const today: Chat[] = []
    const yesterday: Chat[] = []
    const lastWeek: Chat[] = []
    const lastMonth: Chat[] = []
    const older: Record<string, Chat[]> = {}

    // Thresholds for week (~7 days) and month comparisons
    const oneWeekAgo = subMonths(new Date(), 0.25) // ~7 days ago
    const oneMonthAgo = subMonths(new Date(), 1)

    chats.value?.forEach((chat) => {
      const chatDate = new Date(chat.createdAt)

      if (isToday(chatDate)) {
        today.push(chat)
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat)
      } else if (chatDate >= oneWeekAgo) {
        lastWeek.push(chat)
      } else if (chatDate >= oneMonthAgo) {
        lastMonth.push(chat)
      } else {
        // Group older chats by formatted month-year label
        const monthYear = chatDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })

        if (!older[monthYear]) {
          older[monthYear] = []
        }

        older[monthYear].push(chat)
      }
    })

    // Sort month-year keys newest-first for stable display order
    const sortedMonthYears = Object.keys(older).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateB.getTime() - dateA.getTime()
    })

    // Build normalized group objects for UI navigation
    const formattedGroups = [] as Array<{
      id: string
      label: string
      items: Array<Chat>
    }>

    // Append non-empty recency groups in fixed order
    if (today.length) {
      formattedGroups.push({
        id: 'today',
        label: 'Today',
        items: today,
      })
    }

    if (yesterday.length) {
      formattedGroups.push({
        id: 'yesterday',
        label: 'Yesterday',
        items: yesterday,
      })
    }

    if (lastWeek.length) {
      formattedGroups.push({
        id: 'last-week',
        label: 'Last week',
        items: lastWeek,
      })
    }

    if (lastMonth.length) {
      formattedGroups.push({
        id: 'last-month',
        label: 'Last month',
        items: lastMonth,
      })
    }

    // Append each populated month-year group
    sortedMonthYears.forEach((monthYear) => {
      if (older[monthYear]?.length) {
        formattedGroups.push({
          id: monthYear,
          label: monthYear,
          items: older[monthYear],
        })
      }
    })

    return formattedGroups
  })

  return {
    groups,
  }
}
