"use client"

import { useState, FormEvent, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Lock, CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError("")

    if (password !== passwordConfirm) {
      setError("Passwords do not match")
      setStatus("error")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setStatus("error")
      return
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to reset password")
      }

      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setStatus("error")
    }
  }

  if (!token) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center gap-3 rounded-md bg-danger/10 p-3 text-center text-sm text-danger">
          <AlertCircle className="h-6 w-6" />
          <span>Invalid link</span>
        </div>
        <div className="mt-3 text-center">
          <a href="/forgot-password" className="text-sm text-primary hover:underline">
            Request new link
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5">
      {status === "success" ? (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2 rounded-md bg-success/10 p-3 text-center text-sm text-success">
            <CheckCircle className="h-6 w-6" />
            <span>Password reset successful</span>
          </div>
          <a href="/login">
            <button className="w-full cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90">
              Login Sekarang
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
            <label className="compact-label">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="At least 8 characters"
                className="compact-input w-full !pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
          <div>
            <label className="compact-label">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Re-enter password"
                className="compact-input w-full !pl-10"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full cursor-pointer rounded-md border border-primary bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Processing..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-whiten px-4">
      <div className="w-full max-w-md rounded-lg border border-stroke bg-white shadow-default">
        <div className="border-b border-stroke px-5 py-3">
          <h3 className="text-lg font-semibold text-black">Reset Password</h3>
        </div>
        <Suspense
          fallback={
            <div className="p-5">
              <div className="text-center text-sm text-gray-500">Loading...</div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
