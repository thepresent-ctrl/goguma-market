import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_LABEL: Record<string, string> = {
  electronics: '📱 전자기기',
  clothes: '👕 의류',
  books: '📚 책/교재',
  toys: '🧸 장난감',
  food: '🍕 식품',
  etc: '📦 기타',
}

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single()

  const nickname = profile?.nickname ?? '고구마'

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // 판매자 닉네임 한 번에 가져오기
  const userIds = [...new Set(products?.map(p => p.user_id) ?? [])]
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, nickname')
    .in('id', userIds)

  const sellerMap: Record<string, string> = Object.fromEntries(
    sellers?.map(s => [s.id, s.nickname]) ?? []
  )

  // 상품별 좋아요 수 / 댓글 수 (한 번에 가져와서 집계)
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
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-gray-600">👋 {nickname}님</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="goguma-btn goguma-btn-white text-sm py-2 px-4">
              로그아웃
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto">
        <Link href="/market/sell" className="goguma-btn goguma-btn-orange w-full mb-6 block text-center">
          🏷️ 내 물건 팔기
        </Link>

        {!products || products.length === 0 ? (
          <div className="goguma-card text-center py-12">
            <div className="text-5xl mb-4">🛒</div>
            <p className="font-black text-lg mb-1">아직 상품이 없어요!</p>
            <p className="text-gray-400 font-semibold text-sm">첫 번째로 물건을 올려봐요 ㅎㅎ</p>
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
                {/* 상품 이미지 */}
                <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden" style={{ height: 140 }}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF3EE', color: 'var(--goguma-orange)' }}>
                    {CATEGORY_LABEL[product.category] ?? product.category}
                  </span>
                  <p className="font-black text-sm mt-1 line-clamp-1">{product.title}</p>
                  <p className="font-black text-base mt-1" style={{ color: 'var(--goguma-orange)' }}>
                    {product.price.toLocaleString()}원
                  </p>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    👤 {sellerMap[product.user_id] ?? '고구마유저'}
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
