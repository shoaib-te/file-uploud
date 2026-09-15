import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { File } from "@/models/File";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface JwtPayload {
  id: string;
  email: string;
}

async function getOwnerId() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded.id || null;
  } catch {
    return null;
  }
}

// 1. UPDATE metadata (e.g., changing file name)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const ownerId = await getOwnerId();
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const updatedFile = await File.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if (!updatedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedFile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. DELETE file record
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const ownerId = await getOwnerId();
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    // Optional: Fetch file first if you need to delete it from S3/Appwrite bucket using bucketFileId
    const fileRecord = await File.findOne({ _id: id, owner: ownerId });
    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // TODO: Insert your Cloud Storage deletion logic here using fileRecord.bucketFileId

    await File.findOneAndDelete({ _id: id, owner: ownerId });

    return NextResponse.json({ success: true, message: "File record deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. SHARE file (Add user emails or IDs to 'users' array via PATCH)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const ownerId = await getOwnerId();
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { userEmailToShare } = body; // assuming you append strings/emails to the array

    if (!userEmailToShare) {
      return NextResponse.json({ error: "User target required to share" }, { status: 400 });
    }

    // $addToSet ensures the user isn't duplicated in the array
    const sharedFile = await File.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { $addToSet: { users: userEmailToShare } },
      { new: true }
    );

    if (!sharedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sharedFile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 4. DOWNLOAD file proxy stream
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const ownerId = await getOwnerId();
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const fileRecord = await File.findOne({ _id: id, owner: ownerId });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Fetch the actual file file stream from your bucket URL
    const response = await fetch(fileRecord.url);
    if (!response.ok) throw new Error("Failed to fetch file from storage source.");

    const fileBuffer = await response.arrayBuffer();

    // Trigger explicit browser download with correct headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileRecord.name}.${fileRecord.extension}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
