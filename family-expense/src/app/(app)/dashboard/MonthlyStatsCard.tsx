import { connection } from 'next/server'
import { getMonthlyStats } from '@/actions/reports'
import { getCurrentYearMonth } from '@/lib/utils'
import MonthSwitcherClient from './MonthSwitcherClient'

export default async function MonthlyStatsCard() {
  await connection()
  const { year, month } = getCurrentYearMonth()
  const data = await getMonthlyStats(year, month)
  return <MonthSwitcherClient initialYear={year} initialMonth={month} initialData={data} />
}
