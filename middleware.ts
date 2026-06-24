export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resume/:path*',
    '/portfolio/settings/:path*',
    '/jobs/:path*',
    '/settings/:path*',
    '/saved-jobs/:path*',
  ],
}
