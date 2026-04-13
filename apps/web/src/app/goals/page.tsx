'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type DailyLog, getWeightMetrics } from '@/lib/weight-metrics'

type Goal = {
  id: string
  created_at: string
  goal_type: 'cut' | 'maintain' | 'bulk'
  target_weekly_rate: number
}

export default function GoalsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)

  const [goalType, setGoalType] = useState<Goal['goal_type']>('maintain')
  const [targetWeeklyRate, setTargetWeeklyRate] = useState('')

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })

    setLogs(data ?? [])
  }

  const fetchActiveGoal = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setActiveGoal(data ?? null)
  }

  useEffect(() => {
    const loadGoalsPageData = async () => {
      setLoading(true)
      await Promise.all([fetchLogs(), fetchActiveGoal()])
      setLoading(false)
    }

    void loadGoalsPageData()
  }, [])

  const { weeklyChange } = getWeightMetrics(logs)

  const goalStatus =
    activeGoal === null
      ? 'No goal set'
      : weeklyChange === null
        ? 'Not enough data'
        : Math.abs(weeklyChange - activeGoal.target_weekly_rate) <= 0.2
          ? 'On track'
          : weeklyChange < activeGoal.target_weekly_rate - 0.2
            ? 'Faster than target'
            : 'Slower than target'

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase.from('goals').insert([
      {
        goal_type: goalType,
        target_weekly_rate: Number(targetWeeklyRate)
      }
    ])

    if (error) {
      console.error('Goal insert error:', error)
      alert(`Goal insert error: ${error.message}`)
      return
    }

    console.log('Goal insert success:', data)

    setTargetWeeklyRate('')
    await fetchActiveGoal()
  }

  return (
    <main className="min-h-screen p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
      </div>

      {loading ? (
        <p>Loading goals...</p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleGoalSubmit} className="space-y-4 border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Set Goal</h2>

            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as Goal['goal_type'])}
              className="border p-2 w-full rounded"
            >
              <option value="cut">cut</option>
              <option value="maintain">maintain</option>
              <option value="bulk">bulk</option>
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Target weekly rate"
              value={targetWeeklyRate}
              onChange={(e) => setTargetWeeklyRate(e.target.value)}
              required
              className="border p-2 w-full rounded"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Goal
            </button>
          </form>

          <div className="space-y-3 border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Active Goal</h2>
            <p>
              <strong>Goal Type:</strong> {activeGoal?.goal_type ?? '—'}
            </p>
            <p>
              <strong>Target Rate:</strong>{' '}
              {activeGoal !== null
                ? `${activeGoal.target_weekly_rate >= 0 ? '+' : ''}${activeGoal.target_weekly_rate.toFixed(2)} lb/week`
                : '—'}
            </p>
            <p>
              <strong>Status:</strong> {goalStatus}
            </p>
            <p>
              <strong>Actual Weekly Change:</strong>{' '}
              {weeklyChange !== null
                ? `${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(2)} lb/week`
                : '—'}
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
