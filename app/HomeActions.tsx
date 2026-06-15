'use client'

import { useRouter } from 'next/navigation'

export default function HomeActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter()

  const buttons = [
    {
      label: '🏷️ 싸게팔기',
      onClick: () => router.push(isLoggedIn ? '/market/sell' : '/login'),
    },
    {
      label: '🎁 득템하기',
      onClick: () => router.push(isLoggedIn ? '/market' : '/login'),
    },
    {
      label: '💬 채팅하기',
      onClick: () => alert('채팅 기능은 준비중이에요! 🛠️\n조금만 기다려주세요 ㅎㅎ'),
    },
  ]

  return (
    <div className="mt-8 flex gap-4 text-center">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className="bg-white border-2 border-black rounded-2xl px-4 py-3 shadow-[3px_3px_0px_black] font-bold text-sm cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black] transition-all"
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
