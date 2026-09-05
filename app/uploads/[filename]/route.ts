import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Serving uploaded files through Next's static /public handling doesn't
// work here: Next.js snapshots the public/ file list once at server boot,
// so files written after startup 404 until the process restarts. A route
// handler reads the filesystem live on every request instead.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  if (!/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/i.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()!.toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
