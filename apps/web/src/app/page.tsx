'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type DailyLog = {
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

export default function HomePage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  const [weight, setWeight] = useState('')
  const [calories, setCalories] = useState('')

  const fetchLogs = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })

    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const loadLogs = async () => {
      await fetchLogs()
    }

    void loadLogs()
  }, [])

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

  const logsWithCalories = logs.filter((log) => log.calories !== null)
  const averageCalories =
    logsWithCalories.length > 0
      ? logsWithCalories.reduce((sum, log) => sum + (log.calories ?? 0), 0) /
        logsWithCalories.length
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase.from('daily_logs').insert([
      {
        log_date: today,
        body_weight: weight ? Number(weight) : null,
        calories: calories ? Number(calories) : null
      }
    ])

    if (error) {
      console.error('Insert error:', error)
      alert(`Insert error: ${error.message}`)
      return
    }

    console.log('Insert success:', data)

    setWeight('')
    setCalories('')
    fetchLogs()
  }

  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-3xl font-bold">Fitness Intelligence App</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-xl font-semibold">Add Daily Log</h2>

        <input
          type="number"
          placeholder="Body weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Log
        </button>
      </form>

      {/* DATA */}
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div className="space-y-6">
          <p className="text-lg mb-4">Found {logs.length} daily log(s).</p>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Latest weight</p>
              <p className="text-2xl font-semibold">
                {latestWeight !== null ? latestWeight : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Average calories</p>
              <p className="text-2xl font-semibold">
                {averageCalories !== null ? Math.round(averageCalories) : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Trend Weight</p>
              <p className="text-2xl font-semibold">
                {trendWeight !== null ? trendWeight.toFixed(1) : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Weekly Change</p>
              <p className="text-2xl font-semibold">
                {weeklyChange !== null
                  ? `${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(2)} lb/week`
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total logs</p>
              <p className="text-2xl font-semibold">{logs.length}</p>
            </div>
          </section>

          {logs.length === 0 ? (
            <p>No logs yet.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="border p-4 rounded-lg">
                  <p><strong>Date:</strong> {log.log_date}</p>
                  <p><strong>Weight:</strong> {log.body_weight ?? '—'}</p>
                  <p><strong>Calories:</strong> {log.calories ?? '—'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}
