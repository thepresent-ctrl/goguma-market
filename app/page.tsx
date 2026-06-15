import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HomeActions from './HomeActions'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('nickname').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="min-h-screen star-bg flex flex-col items-center justify-center p-6">
      {/* 헤더 */}
      <div className="animate-bounce-in text-center mb-10">
        <div className="text-8xl mb-4 animate-float inline-block">🍠</div>
        <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--goguma-orange)', textShadow: '3px 3px 0px var(--goguma-dark)' }}>
          고구마마켓
        </h1>
        <p className="text-xl font-bold mt-3" style={{ color: 'var(--goguma-purple)' }}>
          우리 동네 중고거래 짱짱맨!! 🔥
        </p>
        <p className="text-base font-semibold mt-1 text-gray-500">
          싸고 좋은 거 겟또해보자구요 ㅋㅋ
        </p>
      </div>

      {/* 카드 */}
      <div className="goguma-card w-full max-w-md text-center">
        {user ? (
          <div>
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-xl font-black mb-2">환영합니다~!!!</p>
            <p className="font-bold text-gray-500 mb-6 text-sm">👤 {profile?.nickname ?? user.email}</p>
            <div className="flex flex-col gap-3">
              <Link href="/market" className="goguma-btn goguma-btn-orange w-full">
                🛒 마켓 구경가기
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="goguma-btn goguma-btn-white w-full">
                  🚪 로그아웃
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-4">👋</div>
            <p className="text-xl font-black mb-1">어서오세요!!!</p>
            <p className="font-semibold text-gray-500 mb-6 text-sm">로그인하고 중고거래 시작해봐요</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="goguma-btn goguma-btn-orange w-full">
                🔑 로그인하기
              </Link>
              <Link href="/signup" className="goguma-btn goguma-btn-yellow w-full">
                ✏️ 회원가입하기
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 3개 — 로그인 여부에 따라 다르게 동작 */}
      <HomeActions isLoggedIn={!!user} />

      <p className="mt-8 text-xs font-bold text-gray-400">
        Made with 🍠 by 고구마마켓팀
      </p>
    </div>
  )
}
