import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_LABEL: Record<string, string> = {
  electronics: '📱 전자기기',
  clothes: '👕 의류',
  books: '📚 책/교재',
  toys: '🧸 장난감',
  food: '🍕 식품',
  etc: '📦 기타',
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, bio, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const isMe = user.id === id

  // 이 사용자가 올린 상품
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // 상품별 좋아요 수 / 댓글 수 집계
  const productIds = products?.map(p => p.id) ?? []

  const { data: allLikes } = productIds.length
    ? await supabase.from('likes').select('product_id').in('product_id', productIds)
    : { data: [] }

  const { data: allComments } = productIds.length
    ? await supabase.from('comments').select('product_id').in('product_id', productIds)
    : { data: [] }

  const likeCountMap: Record<string, number> = {}
  allLikes?.forEach(l => { likeCountMap[l.product_id] = (likeCountMap[l.product_id] ?? 0) + 1 })

  const commentCountMap: Record<string, number> = {}
  allComments?.forEach(c => { commentCountMap[c.product_id] = (commentCountMap[c.product_id] ?? 0) + 1 })

  return (
    <div className="min-h-screen star-bg p-6">
      {/* 네비게이션 */}
      <nav className="max-w-2xl mx-auto flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🍠</span>
          <span className="text-xl font-black" style={{ color: 'var(--goguma-orange)' }}>
            고구마마켓
          </span>
        </Link>
        <Link href="/market" className="goguma-btn goguma-btn-white text-sm py-2 px-4">
          ← 목록
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto">
        {/* 프로필 카드 */}
        <div className="goguma-card text-center mb-6">
          <div
            className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center bg-gray-100"
            style={{ border: '3px solid black', boxShadow: '4px 4px 0px black' }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.nickname} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">🍠</span>
            )}
          </div>

          <h1 className="text-2xl font-black">{profile.nickname}</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
          </p>

          <p className="font-semibold text-gray-600 mt-4 whitespace-pre-wrap">
            {profile.bio ? profile.bio : <span className="text-gray-400">아직 자기소개가 없어요 🙂</span>}
          </p>

          {isMe && (
            <Link href="/profile/edit" className="goguma-btn goguma-btn-yellow inline-block mt-5 py-2 px-5 text-sm">
              ✏️ 프로필 수정
            </Link>
          )}
        </div>

        {/* 작성한 글 모아보기 */}
        <h2 className="font-black text-lg mb-3">
          📦 {profile.nickname}님의 판매글 {products?.length ?? 0}
        </h2>

        {!products || products.length === 0 ? (
          <div className="goguma-card text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="font-black text-lg mb-1">아직 올린 상품이 없어요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/market/${product.id}`}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                style={{ border: '3px solid black', boxShadow: '4px 4px 0px black', display: 'block' }}
              >
                <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden" style={{ height: 140 }}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                <div className="p-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF3EE', color: 'var(--goguma-orange)' }}>
                    {CATEGORY_LABEL[product.category] ?? product.category}
                  </span>
                  <p className="font-black text-sm mt-1 line-clamp-1">{product.title}</p>
                  <p className="font-black text-base mt-1" style={{ color: 'var(--goguma-orange)' }}>
                    {product.price.toLocaleString()}원
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1.5">
                    <span>👀 {product.view_count}</span>
                    <span>❤️ {likeCountMap[product.id] ?? 0}</span>
                    <span>💬 {commentCountMap[product.id] ?? 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
