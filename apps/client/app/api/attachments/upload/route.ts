import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
]

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const file = formData.get("file") as File
  const userId = formData.get("userId") as string
  const templateId = formData.get("templateId") as string

  if (!file || !userId || !templateId) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = path.extname(file.name)
  const fileName = `${crypto.randomUUID()}${ext}`

  const dir = path.join(
    process.cwd(),
    "storage",
    "attachments",
    userId,
    "templates",
    templateId
  )

  await fs.mkdir(dir, { recursive: true })

  const filePath = path.join(dir, fileName)
  await fs.writeFile(filePath, buffer)

  return NextResponse.json({
    path: `attachments/${userId}/templates/${templateId}/${fileName}`,
    name: file.name,
    size: file.size,
    mime: file.type,
  })
}
