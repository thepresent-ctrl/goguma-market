'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 해요! 🔒')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setError('이미 가입된 이메일이에요! 😅')
      } else {
        setError(`오류: ${error.message}`)
      }
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen star-bg flex flex-col items-center justify-center p-6">
        <div className="goguma-card w-full max-w-md text-center animate-bounce-in">
          <div className="text-6xl mb-4">🎊</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--goguma-orange)' }}>
            가입 완료!!!!!
          </h2>
          <p className="font-bold text-gray-600 mb-2">
            이메일 인증 링크를 보내드렸어요~
          </p>
          <p className="text-sm text-gray-500 mb-6 font-semibold">
            {email} 로 가서 인증하고 로그인하면 돼요!
          </p>
          <Link href="/login" className="goguma-btn goguma-btn-orange w-full">
            🔑 로그인하러 가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen star-bg flex flex-col items-center justify-center p-6">
      <Link href="/" className="text-5xl mb-6 inline-block animate-float">🍠</Link>

      <div className="goguma-card w-full max-w-md animate-bounce-in">
        <h1 className="text-3xl font-black text-center mb-1" style={{ color: 'var(--goguma-purple)' }}>
          회원가입
        </h1>
        <p className="text-center text-gray-500 font-semibold mb-8 text-sm">
          고구마마켓 가족이 되어보아요!! 🍠
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block font-black text-sm mb-2">😎 닉네임</label>
            <input
              type="text"
              className="goguma-input"
              placeholder="ex) 고구마왕자"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
            />
          </div>

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
            <label className="block font-black text-sm mb-2">🔒 비밀번호 <span className="font-normal text-gray-400">(6자 이상)</span></label>
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
            className="goguma-btn goguma-btn-purple w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 가입 중...' : '✨ 가입하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-black" style={{ color: 'var(--goguma-orange)' }}>
              로그인하기 →
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
