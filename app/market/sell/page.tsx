'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'electronics', label: '📱 전자기기' },
  { value: 'clothes', label: '👕 의류' },
  { value: 'books', label: '📚 책/교재' },
  { value: 'toys', label: '🧸 장난감' },
  { value: 'food', label: '🍕 식품' },
  { value: 'etc', label: '📦 기타' },
]

export default function SellPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    if (!user) {
      router.push('/login')
      return
    }

    let image_url: string | null = null

    // 이미지가 있으면 먼저 업로드
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError('이미지 업로드에 실패했어요 😢')
        setLoading(false)
        return
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      image_url = data.publicUrl
    }

    // 상품 정보 저장
    const { error: insertError } = await supabase.from('products').insert({
      user_id: user.id,
      title,
      description,
      price: parseInt(price),
      category,
      image_url,
    })

    if (insertError) {
      setError('상품 등록에 실패했어요 😢 다시 시도해봐요')
      setLoading(false)
      return
    }

    router.push('/market')
    router.refresh()
  }

  return (
    <div className="min-h-screen star-bg p-6">
      {/* 네비게이션 */}
      <nav className="max-w-lg mx-auto flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="font-black" style={{ color: 'var(--goguma-orange)' }}>고구마마켓</span>
        </Link>
        <Link href="/market" className="goguma-btn goguma-btn-white text-sm py-2 px-4">
          ← 뒤로
        </Link>
      </nav>

      <div className="max-w-lg mx-auto goguma-card animate-bounce-in">
        <h1 className="text-2xl font-black text-center mb-1" style={{ color: 'var(--goguma-orange)' }}>
          🏷️ 상품 팔기
        </h1>
        <p className="text-center text-gray-500 font-semibold text-sm mb-7">
          안 쓰는 물건을 올려봐요!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 이미지 업로드 */}
          <div>
            <label className="block font-black text-sm mb-2">📸 사진</label>
            <label className="block cursor-pointer">
              <div
                className="border-3 border-dashed rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  border: '3px dashed #C0A882',
                  height: 200,
                  background: '#FFFBF5',
                }}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="font-bold text-sm">클릭해서 사진 추가</p>
                    <p className="text-xs">JPG, PNG 파일</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block font-black text-sm mb-2">📂 카테고리</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className="py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all"
                  style={{
                    borderColor: category === c.value ? 'var(--goguma-orange)' : '#E0D5C8',
                    background: category === c.value ? '#FFF3EE' : 'white',
                    color: category === c.value ? 'var(--goguma-orange)' : '#888',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 상품명 */}
          <div>
            <label className="block font-black text-sm mb-2">✏️ 상품 이름</label>
            <input
              type="text"
              className="goguma-input"
              placeholder="ex) 닌텐도 스위치 팔아요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 가격 */}
          <div>
            <label className="block font-black text-sm mb-2">💰 가격 (원)</label>
            <input
              type="number"
              className="goguma-input"
              placeholder="ex) 150000"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block font-black text-sm mb-2">📝 설명</label>
            <textarea
              className="goguma-input"
              style={{ minHeight: 100, resize: 'vertical' }}
              placeholder="상품 상태, 구매 시기 등을 적어주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
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
            disabled={loading || !category}
            className="goguma-btn goguma-btn-orange w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 등록 중...' : '🚀 등록하기'}
          </button>

          {!category && (
            <p className="text-center text-xs text-gray-400 font-semibold -mt-2">
              카테고리를 먼저 선택해주세요!
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
