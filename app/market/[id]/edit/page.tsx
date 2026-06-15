'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'electronics', label: '📱 전자기기' },
  { value: 'clothes',     label: '👕 의류' },
  { value: 'books',       label: '📚 책/교재' },
  { value: 'toys',        label: '🧸 장난감' },
  { value: 'food',        label: '🍕 식품' },
  { value: 'etc',         label: '📦 기타' },
]

const STATUSES = [
  { value: 'selling',  label: '🟢 판매중' },
  { value: 'reserved', label: '🟠 예약중' },
  { value: 'sold',     label: '⚫ 판매완료' },
]

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('selling')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (!product || product.user_id !== user.id) {
        router.push('/market')
        return
      }

      setTitle(product.title)
      setDescription(product.description)
      setPrice(String(product.price))
      setCategory(product.category)
      setStatus(product.status)
      setExistingImageUrl(product.image_url)
      setImagePreview(product.image_url)
      setFetching(false)
    }
    fetchProduct()
  }, [id, router])

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
    if (!user) return

    let image_url = existingImageUrl

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

    const { error: updateError } = await supabase
      .from('products')
      .update({ title, description, price: parseInt(price), category, status, image_url })
      .eq('id', id)

    if (updateError) {
      setError('수정에 실패했어요 😢 다시 시도해봐요')
      setLoading(false)
      return
    }

    router.push(`/market/${id}`)
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
        <Link href={`/market/${id}`} className="goguma-btn goguma-btn-white text-sm py-2 px-4">
          ← 뒤로
        </Link>
      </nav>

      <div className="max-w-lg mx-auto goguma-card">
        <h1 className="text-2xl font-black text-center mb-1" style={{ color: 'var(--goguma-purple)' }}>
          ✏️ 상품 수정
        </h1>
        <p className="text-center text-gray-500 font-semibold text-sm mb-7">
          정보를 바꿔봐요!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 이미지 */}
          <div>
            <label className="block font-black text-sm mb-2">📸 사진</label>
            <label className="block cursor-pointer">
              <div
                className="rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ border: '3px dashed #C0A882', height: 180, background: '#FFFBF5' }}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="font-bold text-sm">클릭해서 사진 변경</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* 판매 상태 */}
          <div>
            <label className="block font-black text-sm mb-2">🔖 판매 상태</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className="flex-1 py-2 px-3 rounded-xl border-2 font-bold text-sm transition-all"
                  style={{
                    borderColor: status === s.value ? 'var(--goguma-orange)' : '#E0D5C8',
                    background:  status === s.value ? '#FFF3EE' : 'white',
                    color:       status === s.value ? 'var(--goguma-orange)' : '#888',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
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
                    background:  category === c.value ? '#FFF3EE' : 'white',
                    color:       category === c.value ? 'var(--goguma-orange)' : '#888',
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
