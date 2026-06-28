import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getServerSupabase } from '@/lib/supabase'
import { generateSlug } from '@/lib/utils'

export const authOptions: NextAuthOptions = {
  // JWT-only — no DB adapter needed for sessions
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Email/password login
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findByEmail(credentials.email)
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email ?? '', name: user.name ?? '', image: user.image ?? '' }
      },
    }),

    // Supabase OAuth bridge — called from /auth/callback after Supabase OAuth flow
    CredentialsProvider({
      id: 'supabase-oauth',
      name: 'Supabase OAuth',
      credentials: {
        email: {},
        accessToken: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.accessToken) return null

        // Verify the Supabase access token is genuine
        const sb = getServerSupabase()
        const { data: { user: sbUser }, error } = await sb.auth.getUser(credentials.accessToken)
        if (error || !sbUser || sbUser.email !== credentials.email) return null

        // Get or create the user in our public.users table
        let dbUser = await db.user.findByEmail(sbUser.email)
        if (!dbUser) {
          const name = (sbUser.user_metadata?.full_name as string)
            || (sbUser.user_metadata?.name as string)
            || sbUser.email.split('@')[0]
          const username = await makeUniqueUsername(name)
          dbUser = await db.user.create({
            name,
            email: sbUser.email,
            username,
            image: (sbUser.user_metadata?.avatar_url as string) ?? undefined,
          })
        } else if (!dbUser.username) {
          const username = await makeUniqueUsername(dbUser.name ?? sbUser.email.split('@')[0])
          await db.user.update(dbUser.id, { username })
          dbUser = await db.user.findById(dbUser.id)
        }

        if (!dbUser) return null
        return { id: dbUser.id, email: dbUser.email ?? '', name: dbUser.name ?? '', image: dbUser.image ?? '' }
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true
    },

    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      if (token.id) {
        const dbUser = await db.user.findById(token.id as string)
        if (dbUser) {
          token.credits = dbUser.credits as number
          token.username = (dbUser.username as string) ?? ''
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.credits = token.credits as number
        session.user.username = token.username as string
      }
      return session
    },
  },
}

async function makeUniqueUsername(base: string): Promise<string> {
  const slug = generateSlug(base) || 'user'
  const existing = await db.user.findByUsername(slug)
  if (!existing) return slug
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`
}
