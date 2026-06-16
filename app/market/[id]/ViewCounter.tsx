'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ViewCounter({ productId }: { productId: string }) {
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    createClient().rpc('increment_product_views', { pid: productId }).then(() => {})
  }, [productId])

  return null
}
