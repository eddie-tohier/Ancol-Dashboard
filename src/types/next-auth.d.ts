import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "super_admin" | "admin" | "manajemen"
    accessToken: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string
      role: "super_admin" | "admin" | "manajemen"
      accessToken: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string
    role: "super_admin" | "admin" | "manajemen"
    accessToken: string
  }
}
