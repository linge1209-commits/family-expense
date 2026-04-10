'use client'

import { useEffect, useState } from 'react'

function getMothersDaySunday(year: number): { month: number; day: number } {
  // 母親節 = 五月第二個星期日
  let sundays = 0
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, 4, d) // 五月
    if (date.getMonth() !== 4) break
    if (date.getDay() === 0) {
      sundays++
      if (sundays === 2) return { month: 5, day: d }
    }
  }
  return { month: 5, day: 14 } // fallback
}

interface Greeting {
  emoji: string[]
  title: string
  message: string
  gradient: string
}

export default function SpecialDayGreeting() {
  const [greeting, setGreeting] = useState<Greeting | null>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const year = now.getFullYear()

    const mothersDay = getMothersDaySunday(year)

    if (month === mothersDay.month && day === mothersDay.day) {
      setGreeting({
        emoji: ['🌸', '💐', '🌺', '💝'],
        title: '母親節快樂',
        message: '親愛的老婆，謝謝妳每天的付出與愛，妳是我們最棒的媽媽！',
        gradient: 'from-pink-400 to-rose-400',
      })
    } else if (month === 12 && day === 6) {
      setGreeting({
        emoji: ['🎂', '🎉', '🎁', '✨'],
        title: '生日快樂',
        message: '親愛的老婆，生日快樂！願妳每一天都如今天般幸福美麗 💕',
        gradient: 'from-purple-400 to-pink-400',
      })
    }
  }, [])

  if (!greeting || !visible) return null

  return (
    <div className={`relative bg-gradient-to-r ${greeting.gradient} rounded-2xl p-5 text-white shadow-lg overflow-hidden`}>
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 text-6xl opacity-20 select-none pointer-events-none">
        {greeting.emoji[0]}
      </div>
      <div className="absolute bottom-0 left-0 text-5xl opacity-20 select-none pointer-events-none">
        {greeting.emoji[1]}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-white/60 hover:text-white text-lg leading-none"
        aria-label="關閉"
      >
        ✕
      </button>

      <div className="flex items-center gap-2 mb-2">
        {greeting.emoji.map((e, i) => (
          <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
            {e}
          </span>
        ))}
      </div>
      <div className="text-xl font-bold mb-1">{greeting.title}</div>
      <div className="text-sm text-white/90 leading-relaxed">{greeting.message}</div>
    </div>
  )
}
