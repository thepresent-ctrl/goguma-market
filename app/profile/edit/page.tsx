'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfileEditPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, bio')
        .eq('id', user.id)
        .single()

      setUserId(user.id)
      setNickname(profile?.nickname ?? '')
      setBio(profile?.bio ?? '')
      setExistingAvatarUrl(profile?.avatar_url ?? null)
      setImagePreview(profile?.avatar_url ?? null)
      setFetching(false)
    }
    fetchProfile()
  }, [router])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let avatar_url = existingAvatarUrl

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filePath = `${user.id}/avatar_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError('이미지 업로드에 실패했어요 😢')
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      avatar_url = data.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nickname, bio, avatar_url })
      .eq('id', user.id)

    if (updateError) {
      setError('저장에 실패했어요 😢 다시 시도해봐요')
      setLoading(false)
      return
    }

    router.push(`/profile/${user.id}`)
    router.refresh()
  }

  if (fetching) {
    return (
      <div className="min-h-screen star-bg flex items-center justify-center">
        <div className="text-4xl animate-wiggle">🍠</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen star-bg p-6">
      <nav className="max-w-lg mx-auto flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="font-black" style={{ color: 'var(--goguma-orange)' }}>고구마마켓</span>
        </Link>
        <Link href={`/profile/${userId}`} className="goguma-btn goguma-btn-white text-sm py-2 px-4">
          ← 뒤로
        </Link>
      </nav>

      <div className="max-w-lg mx-auto goguma-card">
        <h1 className="text-2xl font-black text-center mb-1" style={{ color: 'var(--goguma-purple)' }}>
          ✏️ 프로필 수정
        </h1>
        <p className="text-center text-gray-500 font-semibold text-sm mb-7">
          나를 소개해봐요!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 프로필 사진 */}
          <div>
            <label className="block font-black text-sm mb-2">📸 프로필 사진</label>
            <label className="block cursor-pointer">
              <div
                className="w-28 h-28 rounded-full mx-auto flex items-center justify-center overflow-hidden"
                style={{ border: '3px dashed #C0A882', background: '#FFFBF5' }}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-3xl">📷</div>
                    <p className="font-bold text-xs mt-1">사진 추가</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* 닉네임 */}
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

          {/* 자기소개 */}
          <div>
            <label className="block font-black text-sm mb-2">📝 자기소개</label>
            <textarea
              className="goguma-input"
              style={{ minHeight: 100, resize: 'vertical' }}
              placeholder="나를 소개하는 글을 적어보세요"
              value={bio}
              onChange={e => setBio(e.target.value)}
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
            className="goguma-btn goguma-btn-purple w-full mt-2 disabled:opacity-60"
          >
            {loading ? '⏳ 저장 중...' : '💾 저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
