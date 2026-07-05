"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email atau password salah")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-b from-[#081739] to-[#05163E] p-12 overflow-hidden">
        <div className="z-10">
          <img src="/ancol-connect_white_1.svg" alt="Ancol Connect" className="h-8 w-auto" />
        </div>

        <div className="space-y-6 z-10 -mt-40">
          <h1 className="text-4xl font-extrabold text-white leading-tight font-satoshi">
            Monitor Pembelian
            <br />
            <span style={{ color: "#05afb0" }}>Tiket Ancol</span> via WhatsApp
          </h1>
          <p className="text-base text-gray-400 leading-relaxed max-w-md">
            Dashboard terpusat untuk memantau transaksi pembelian tiket secara real-time melalui WhatsApp Business API.
          </p>
        </div>

        <p className="text-sm text-gray-500 z-10">
          &copy; 2026 Ancol Connect. All rights reserved.
        </p>

        <img
          src="/ancol-illustration.png"
          alt="Ancol Illustration"
          className="absolute bottom-0 left-0 w-full object-cover pointer-events-none select-none opacity-90"
        />
      </div>

      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 367.85 47.82" className="h-7 w-auto">
              <path d="M141.27 46.75c-.88-.22-1.84-1.15-2.11-2.05-.2-.66-.27-5.84-.27-19.64 0-17.39.03-18.8.4-19.53.22-.44.7-.94 1.07-1.12.89-.44 4.18-.58 5.42-.23l.97.27.15 8.4c.08 4.62.12 14.15.08 21.18l-.07 12.78-2.6.03c-1.43.02-2.8-.02-3.05-.08Z" fill="#1c2434"/>
              <path d="m221.35 46.68-1.29-.09.07-10.28c.08-11.41 0-10.83 1.67-13.46 2.53-4 8.23-6.2 14.46-5.58 6.36.64 10.45 3.6 11.87 8.59.4 1.38.43 2.28.43 11.14v9.64l-3.33.03c-2.55.02-3.1-.41-3.34-.67-.17-.18-.12-.95-.12-3.52 0-1.34-.02-3.18-.09-5.67-.26-8.85-.27-9.03-.79-9.92-1.14-1.96-3.5-2.92-6.56-2.69-2.41.19-3.57.66-4.74 1.9-1.62 1.73-1.71 2.31-1.71 10.85 0 6.71-.03 7.37-.41 8.09-.79 1.48-2.34 1.9-6.11 1.62Z" fill="#07b2b4"/>
              <path d="M196.5 47.27c-2.97-.5-6.18-2.26-8.7-4.77-1.9-1.9-2.7-3.24-3.49-5.88-.59-1.98-.64-6.2-.09-8.24 1.35-5.03 4.87-8.54 10.54-10.52 4.7-1.64 11.1-.46 15.37 2.83 2.25 1.73 3.97 4.33 4.95 7.48.41 1.33.51 2.15.5 4.11-.02 3.4-.68 5.63-2.48 8.4-3.26 5-10.05 7.7-16.61 6.6Zm6.04-7.26c2.19-.87 3.81-2.56 4.5-4.71.65-2.02.58-4.89-.15-6.53-1.4-3.12-5.14-5.22-8.3-4.67-3.54.62-6.08 3.17-6.64 6.66-.24 1.5.08 4.11.64 5.27 1.84 3.8 6.1 5.5 9.95 3.97Z" fill="#07b2b4"/>
            </svg>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black">Masuk</h2>
            <p className="mt-1 text-sm text-body">Silakan masuk ke akun Ancol Connect Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="compact-input w-full !pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="compact-input w-full !pl-10 !pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-3 hover:text-body"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="/forgot-password" className="text-sm text-primary hover:underline">
                Lupa Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-md bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
