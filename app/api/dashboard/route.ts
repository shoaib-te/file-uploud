import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { File as FileModel } from "@/models/File";

const STORAGE_LIMIT_BYTES = 128 * 1024 ** 3;

type Category = "image" | "other" | "media" | "document";

interface JwtPayload {
  id: string;
  email: string;
}

interface StoredFile {
  type?: string;
  size?: number;
  createdAt?: Date;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function getCategory(type?: string): Category {
  if (type === "image") return "image";
  if (type === "video" || type === "audio") return "media";
  if (type === "document") return "document";
  return "other";
}

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const files = await FileModel.find({ owner: decoded.id })
      .select("type size createdAt")
      .lean<StoredFile[]>();

    const categoryBytes: Record<Category, number> = {
      image: 0,
      other: 0,
      media: 0,
      document: 0,
    };

    let latestUpload: Date | undefined;
    for (const file of files) {
      const category = getCategory(file.type);
      categoryBytes[category] += file.size || 0;
      if (file.createdAt && (!latestUpload || file.createdAt > latestUpload)) {
        latestUpload = file.createdAt;
      }
    }

    const totalBytes = Object.values(categoryBytes).reduce((total, bytes) => total + bytes, 0);
    const categories = Object.entries(categoryBytes).map(([name, bytes]) => ({
      name,
      bytes,
      size: formatBytes(bytes),
      percentage: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      storageUsedBytes: totalBytes,
      storageUsed: formatBytes(totalBytes),
      storageLimitBytes: STORAGE_LIMIT_BYTES,
      storageLimit: "128 GB",
      usedPercentage: Math.min(100, Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100)),
      collectionsCount: files.length,
      lastUpdated: latestUpload?.toISOString() || new Date().toISOString(),
      categories,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Dashboard stats error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
