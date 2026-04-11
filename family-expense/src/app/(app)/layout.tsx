import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <main className="max-w-lg mx-auto pb-20 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
