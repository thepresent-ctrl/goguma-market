import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from './DeleteButton'
import ViewCounter from './ViewCounter'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'

const CATEGORY_LABEL: Record<string, string> = {
  electronics: '📱 전자기기',
  clothes: '👕 의류',
  books: '📚 책/교재',
  toys: '🧸 장난감',
  food: '🍕 식품',
  etc: '📦 기타',
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  selling:  { label: '판매중',  color: 'var(--goguma-green)' },
  reserved: { label: '예약중',  color: 'var(--goguma-orange)' },
  sold:     { label: '판매완료', color: '#aaa' },
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const isOwner = user.id === product.user_id
  const status = STATUS_LABEL[product.status] ?? STATUS_LABEL.selling

  // 작성자(판매자) 프로필
  const { data: seller } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', product.user_id)
    .single()

  // 좋아요: 개수 + 내가 눌렀는지
  const { count: likeCount } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)

  const { data: myLike } = await supabase
    .from('likes')
    .select('id')
    .eq('product_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  // 댓글: 목록 + 작성자 닉네임
  const { data: rawComments } = await supabase
    .from('comments')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: true })

  const commentUserIds = [...new Set(rawComments?.map(c => c.user_id) ?? [])]
  const { data: commenters } = commentUserIds.length
    ? await supabase.from('profiles').select('id, nickname').in('id', commentUserIds)
    : { data: [] }

  const nicknameMap: Record<string, string> = Object.fromEntries(
    commenters?.map(c => [c.id, c.nickname]) ?? []
  )

  const comments = (rawComments ?? []).map(c => ({
    id: c.id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    nickname: nicknameMap[c.user_id] ?? '고구마유저',
  }))

  return (
    <div className="min-h-screen star-bg p-6">
      {/* 네비게이션 */}
      <nav className="max-w-lg mx-auto flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍠</span>
          <span className="font-black" style={{ color: 'var(--goguma-orange)' }}>고구마마켓</span>
        </Link>
        <Link href="/market" className="goguma-btn goguma-btn-white text-sm py-2 px-4">
          ← 목록
        </Link>
      </nav>

      <div className="max-w-lg mx-auto">
        {/* 이미지 */}
        <div
          className="w-full rounded-3xl overflow-hidden mb-4 flex items-center justify-center bg-gray-100"
          style={{ height: 280, border: '3px solid black', boxShadow: '6px 6px 0px black' }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">📦</span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="goguma-card">
          {/* 카테고리 + 상태 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: '#FFF3EE', color: 'var(--goguma-orange)' }}>
              {CATEGORY_LABEL[product.category] ?? product.category}
            </span>
            <span className="text-sm font-black px-3 py-1 rounded-full text-white" style={{ background: status.color }}>
              {status.label}
            </span>
          </div>

          <h1 className="text-2xl font-black mb-2">{product.title}</h1>
          <p className="text-3xl font-black mb-4" style={{ color: 'var(--goguma-orange)' }}>
            {product.price.toLocaleString()}원
          </p>

          {/* 작성자 — 클릭 시 프로필로 이동 */}
          <Link
            href={`/profile/${product.user_id}`}
            className="flex items-center gap-2 mb-4 w-fit rounded-full pr-3 py-1 hover:bg-gray-50 transition-colors"
          >
            <span
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
              style={{ border: '2px solid black' }}
            >
              {seller?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={seller.avatar_url} alt={seller.nickname} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </span>
            <span className="font-bold text-sm text-gray-700">
              {seller?.nickname ?? '고구마유저'}
            </span>
          </Link>

          <hr className="border-dashed border-gray-200 mb-4" />

          <p className="font-semibold text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">
              등록일: {new Date(product.created_at).toLocaleDateString('ko-KR')}
            </p>
            <p className="text-xs text-gray-400 font-semibold">
              👀 조회 {product.view_count}
            </p>
          </div>

          {/* 좋아요 — 본인 글에는 누를 수 없고 수만 표시 */}
          <div className="flex mt-5">
            {isOwner ? (
              <div
                className="goguma-btn goguma-btn-white flex-1 text-center cursor-default"
                style={{ color: '#888' }}
              >
                ❤️ 좋아요 {likeCount ?? 0}
              </div>
            ) : (
              <LikeButton
                productId={id}
                initialCount={likeCount ?? 0}
                initialLiked={!!myLike}
              />
            )}
          </div>

          {/* 본인 상품일 때만 수정/삭제 버튼 표시 */}
          {isOwner && (
            <div className="flex gap-3 mt-3">
              <Link href={`/market/${id}/edit`} className="goguma-btn goguma-btn-yellow flex-1 text-center">
                ✏️ 수정하기
              </Link>
              <DeleteButton productId={id} />
            </div>
          )}
        </div>

        {/* 댓글 영역 */}
        <CommentSection productId={id} currentUserId={user.id} initialComments={comments} />
      </div>

      {/* 조회수 증가 (마운트 시 1회) */}
      <ViewCounter productId={id} />
    </div>
  )
}
