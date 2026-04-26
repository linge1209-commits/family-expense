'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']

interface Props {
  data: { name: string; icon: string; total: number }[]
}

export default function CategoryChart({ data }: Props) {
  const chartData = data.map(d => ({ name: `${d.icon} ${d.name}`, value: d.total }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`NT$ ${Number(value).toLocaleString('zh-TW')}`, '']}
        />
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  )
}
