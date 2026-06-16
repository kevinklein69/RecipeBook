import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPEG, PNG, WebP oder GIF erlaubt." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Datei darf maximal 10 MB groß sein." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dest = join(process.cwd(), "public", "uploads", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
