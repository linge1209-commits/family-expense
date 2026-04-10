'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">目前沒有網路</h1>
      <p className="text-gray-500 mb-6">請確認網路連線後再試</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl active:scale-95 transition-all"
      >
        重新整理
      </button>
    </div>
  )
}
