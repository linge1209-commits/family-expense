import { Suspense } from 'react'
import LoginForm from './LoginForm'

interface Props {
  searchParams: Promise<{ error?: string }>
}

async function NotAuthorizedAlert({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  if (params.error !== 'not_authorized') return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
      您的帳號尚未被加入家庭成員名單，請聯絡管理員。
    </div>
  )
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-gray-800">家庭記帳本</h1>
          <p className="text-gray-500 mt-2">共同管理家庭支出</p>
        </div>

        <Suspense>
          <NotAuthorizedAlert searchParams={searchParams} />
        </Suspense>

        <LoginForm />

        <p className="text-xs text-gray-400 text-center">
          僅開放家庭成員登入
        </p>
      </div>
    </div>
  )
}
