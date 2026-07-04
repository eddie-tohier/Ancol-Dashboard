import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ message: "Jika email terdaftar, tautan reset password akan dikirim." })
}
