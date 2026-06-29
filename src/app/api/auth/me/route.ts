import { NextResponse } from 'next/server'
import { getUser } from '@/lib/session'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json(null, { status: 401 })
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    credits: user.credits,
    username: user.username,
  })
}
