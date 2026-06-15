'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.push('/market')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex gap-2 flex-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="goguma-btn flex-1 disabled:opacity-60"
          style={{ background: 'var(--goguma-pink)', color: 'white', border: '3px solid black' }}
        >
          {loading ? '⏳' : '🗑️ 진짜 삭제'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="goguma-btn goguma-btn-white flex-1"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="goguma-btn goguma-btn-white flex-1"
      style={{ color: '#e74c3c' }}
    >
      🗑️ 삭제
    </button>
  )
}
