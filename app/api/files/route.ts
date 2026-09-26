import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import { File as FileModel } from "@/models/File";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface JwtPayload {
  id: string;
  email: string;
}

function getFileType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
    return "image";
  }

  if (["mp4", "mkv", "avi", "mov", "webm"].includes(extension)) {
    return "video";
  }

  if (["mp3", "wav", "aac", "flac", "ogg"].includes(extension)) {
    return "audio";
  }

  if (["pdf", "doc", "docx", "txt", "xls", "xlsx", "csv", "ppt", "pptx"].includes(extension)) {
    return "document";
  }

  return "other";
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.cookies.get("app_session")?.value || request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    if (!decoded?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    const files = await FileModel.find({ owner: decoded.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: files }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("File listing error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("app_session")?.value || request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    if (!decoded?.email || !decoded?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token payload" },
        { status: 401 }
      );
    }

    const cloudinaryConfig = [
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET,
    ];

    if (cloudinaryConfig.some((value) => !value?.trim())) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on the server." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof globalThis.File) || !uploadedFile.size) {
      return NextResponse.json(
        { error: "Payload empty: No file element provided." },
        { status: 400 }
      );
    }

    await dbConnect();

    const originalName = uploadedFile.name || "untitled-file";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop()?.toLowerCase() || ""
      : "";
    const type = getFileType(originalName);
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    const uploadResult = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nextjs_uploads",
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary returned no upload result."));
            return;
          }

          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    if (!uploadResult.secure_url || !uploadResult.public_id) {
      return NextResponse.json(
        { error: "Cloudinary did not return a usable uploaded file." },
        { status: 502 }
      );
    }

    const newFile = await FileModel.create({
      name: originalName,
      url: uploadResult.secure_url,
      type,
      size: fileBuffer.length,
      owner: decoded.id,
      extension,
      bucketFileId: uploadResult.public_id,
      users: [],
    });

    return NextResponse.json({ success: true, data: newFile }, { status: 201 });
  } catch (error: unknown) {
    const providerStatus = typeof error === "object" && error !== null && "http_code" in error
      ? (error as { http_code?: number }).http_code
      : undefined;
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Cloudinary/upload error:", {
      status: providerStatus,
      message,
    });

    if (providerStatus === 401 || providerStatus === 403) {
      return NextResponse.json(
        {
          error: "Cloudinary rejected the upload. Check that uploads are enabled for this Cloudinary account and that the current API credentials belong to the same cloud.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}