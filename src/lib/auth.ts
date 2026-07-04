import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        if (email === "admin@ancol.com" && password === "admin123") {
          return {
            id: "1",
            email: "admin@ancol.com",
            name: "Admin Ancol",
            role: "super_admin",
            accessToken: "static-token",
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl))
        }
        return true
      }

      if (!isLoggedIn) {
        return false
      }

      if (pathname.startsWith("/admin") && role !== "super_admin") {
        return false
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.email = user.email!
        token.name = user.name!
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      session.user.name = token.name
      session.user.role = token.role
      session.user.accessToken = token.accessToken
      return session
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
})
