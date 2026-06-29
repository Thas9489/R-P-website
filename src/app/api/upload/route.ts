import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { getServerSupabase } from '@/lib/supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) ?? 'profile'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP or GIF images are allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${type}/${Date.now()}.${ext}`

    const bytes = await file.arrayBuffer()
    const supabase = getServerSupabase()

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('[UPLOAD] Supabase storage error:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage.from('profile-images').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, path })
  } catch (err) {
    console.error('[UPLOAD]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
