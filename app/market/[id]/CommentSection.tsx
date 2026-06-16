'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  user_id: string
  content: string
  created_at: string
  nickname: string
}

export default function CommentSection({
  productId,
  currentUserId,
  initialComments,
}: {
  productId: string
  currentUserId: string
  initialComments: Comment[]
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text || submitting) return

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .insert({ product_id: productId, user_id: currentUserId, content: text })

    setSubmitting(false)
    if (!error) {
      setContent('')
      router.refresh()
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId)
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', commentId)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="goguma-card mt-4">
      <h2 className="font-black text-lg mb-4">💬 댓글 {initialComments.length}</h2>

      {/* 댓글 목록 */}
      {initialComments.length === 0 ? (
        <p className="text-center text-gray-400 font-semibold text-sm py-6">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요! ✏️
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {initialComments.map(c => (
            <div
              key={c.id}
              className="rounded-2xl p-3"
              style={{ background: '#FFFBF5', border: '2px solid #E0D5C8' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-sm">👤 {c.nickname}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold">
                    {new Date(c.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {c.user_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="text-xs font-bold disabled:opacity-50"
                      style={{ color: '#e74c3c' }}
                    >
                      {deletingId === c.id ? '⏳' : '🗑️ 삭제'}
                    </button>
                  )}
                </div>
              </div>
              <p className="font-semibold text-gray-700 text-sm whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="goguma-input"
          style={{ minHeight: 70, resize: 'vertical' }}
          placeholder="댓글을 입력하세요"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="goguma-btn goguma-btn-orange w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? '⏳ 등록 중...' : '✏️ 댓글 등록'}
        </button>
      </form>
    </div>
  )
}
