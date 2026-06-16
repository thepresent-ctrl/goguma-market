'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LikeButton({
  productId,
  initialCount,
  initialLiked,
}: {
  productId: string
  initialCount: number
  initialLiked: boolean
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggleLike() {
    if (loading) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    if (liked) {
      // 좋아요 취소
      setLiked(false)
      setCount(c => c - 1)
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id)
      if (error) {
        setLiked(true)
        setCount(c => c + 1)
      }
    } else {
      // 좋아요 추가 (UNIQUE 제약이 중복 방지)
      setLiked(true)
      setCount(c => c + 1)
      const { error } = await supabase
        .from('likes')
        .insert({ product_id: productId, user_id: user.id })
      if (error) {
        setLiked(false)
        setCount(c => c - 1)
      }
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="goguma-btn goguma-btn-white flex-1 disabled:opacity-60"
      style={{ color: liked ? 'var(--goguma-pink)' : '#888' }}
    >
      {liked ? '❤️' : '🤍'} 좋아요 {count}
    </button>
  )
}
