"use client"

import { useState, FormEvent } from "react"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Terjadi kesalahan")
      }

      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setStatus("error")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-whiten px-4">
      <div className="w-full max-w-md rounded-lg border border-stroke bg-white shadow-default">
        <div className="border-b border-stroke px-5 py-3">
          <h3 className="text-lg font-semibold text-black">Lupa Password</h3>
        </div>
        <div className="p-5">
          {status === "success" ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 rounded-md bg-success/10 p-3 text-center text-sm text-success">
                <CheckCircle className="h-6 w-6" />
                <span>Cek email Anda untuk link reset password</span>
              </div>
              <a href="/login">
                <button className="w-full cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90">
                  <div className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Login
                  </div>
                </button>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {status === "error" && (
                <div className="flex items-center gap-2 rounded-md bg-danger/10 p-2.5 text-sm text-danger">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="compact-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="compact-input w-full !pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Mengirim..." : "Kirim Link Reset"}
              </button>
              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
