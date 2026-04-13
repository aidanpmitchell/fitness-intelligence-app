export type DailyLog = {
  id: string
  log_date: string
  created_at: string
  body_weight: number | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  notes: string | null
}

export const getWeightMetrics = (logs: DailyLog[]) => {
  const latestWeightLog = logs.find((log) => log.body_weight !== null)
  const latestWeight = latestWeightLog?.body_weight ?? null

  const dailyWeightMap = new Map<string, DailyLog>()
  const weightLogs = logs.filter((log) => log.body_weight !== null)

  for (const log of weightLogs) {
    if (!dailyWeightMap.has(log.log_date)) {
      dailyWeightMap.set(log.log_date, log)
    }
  }

  const dailyWeightEntries = Array.from(dailyWeightMap.values()).sort((a, b) =>
    a.log_date.localeCompare(b.log_date)
  )

  const trendSeries = dailyWeightEntries.map((entry, index) => {
    const windowStart = Math.max(0, index - 2)
    const window = dailyWeightEntries.slice(windowStart, index + 1)
    const averageWeight =
      window.reduce((sum, log) => sum + (log.body_weight ?? 0), 0) / window.length

    return {
      date: entry.log_date,
      weight: averageWeight,
      pointCount: window.length
    }
  })

  const latestTrendPoint = trendSeries.at(-1)
  const trendWeight = latestTrendPoint?.weight ?? null

  const latestTrendDate = latestTrendPoint
    ? new Date(`${latestTrendPoint.date}T00:00:00`)
    : null

  const previousTrendPoint =
    latestTrendDate === null
      ? null
      : [...trendSeries]
          .reverse()
          .find((point) => {
            const pointDate = new Date(`${point.date}T00:00:00`)
            const daysBetween =
              (latestTrendDate.getTime() - pointDate.getTime()) / (1000 * 60 * 60 * 24)

            return daysBetween >= 5
          }) ?? null

  const weeklyChange =
    latestTrendPoint !== undefined &&
    previousTrendPoint !== null &&
    latestTrendPoint.pointCount >= 2 &&
    previousTrendPoint.pointCount >= 2 &&
    latestTrendDate !== null
      ? (() => {
          const previousTrendDate = new Date(`${previousTrendPoint.date}T00:00:00`)
          const daysBetween =
            (latestTrendDate.getTime() - previousTrendDate.getTime()) /
            (1000 * 60 * 60 * 24)

          return daysBetween > 0
            ? ((latestTrendPoint.weight - previousTrendPoint.weight) / daysBetween) * 7
            : null
        })()
      : null

  return {
    latestWeight,
    trendWeight,
    weeklyChange
  }
}
