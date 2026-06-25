import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export const authOptions: NextAuthOptions = {
  // JWT-only — no DB adapter needed for sessions
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findByEmail(credentials.email)
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password as string)
        if (!valid) return null
        return { id: user.id as string, email: user.email as string, name: user.name as string, image: user.image as string }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth sign-in: create or find user in Supabase
      if (account?.provider !== 'credentials' && user.email) {
        let existing = await db.user.findByEmail(user.email)
        if (!existing) {
          const username = await makeUniqueUsername(user.name ?? user.email.split('@')[0])
          existing = await db.user.create({
            name: user.name ?? '',
            email: user.email,
            username,
            image: user.image ?? undefined,
          })
        } else if (!existing.username) {
          const username = await makeUniqueUsername(user.name ?? user.email.split('@')[0])
          await db.user.update(existing.id as string, { username })
        }
        // Make sure the user id in the token matches our users table
        user.id = existing.id as string
      }
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
