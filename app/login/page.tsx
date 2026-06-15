'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 틀렸어요 😢')
      setLoading(false)
    } else {
      router.push('/market')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen star-bg flex flex-col items-center justify-center p-6">
      <Link href="/" className="text-5xl mb-6 inline-block animate-float">🍠</Link>

      <div className="goguma-card w-full max-w-md animate-bounce-in">
        <h1 className="text-3xl font-black text-center mb-1" style={{ color: 'var(--goguma-orange)' }}>
          로그인
        </h1>
        <p className="text-center text-gray-500 font-semibold mb-8 text-sm">
          다시 돌아오셨군요~!! 반가워요 ㅎㅎ
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block font-black text-sm mb-2">📧 이메일</label>
            <input
              type="email"
              className="goguma-input"
              placeholder="goguma@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-black text-sm mb-2">🔒 비밀번호</label>
            <input
              type="password"
              className="goguma-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 font-bold text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="goguma-btn goguma-btn-orange w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 로그인 중...' : '🔑 로그인하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-gray-500">
            아직 회원이 아니신가요?{' '}
            <Link href="/signup" className="font-black" style={{ color: 'var(--goguma-purple)' }}>
              회원가입하기 →
            </Link>
          </p>
        </div>
      </div>

      <Link href="/" className="mt-6 font-bold text-sm text-gray-500 hover:text-gray-700">
        ← 홈으로 돌아가기
      </Link>
    </div>
  )
}
