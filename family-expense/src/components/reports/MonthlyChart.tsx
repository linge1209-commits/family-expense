'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: { label: string; total: number }[]
}

export default function MonthlyChart({ data }: Props) {
  // 縮短 label 顯示
  const chartData = data.map(d => ({
    ...d,
    label: d.label.replace(' 年 ', '/').replace(' 月', ''),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip
          formatter={(value) => [`NT$ ${Number(value).toLocaleString('zh-TW')}`, '支出']}
        />
        <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
