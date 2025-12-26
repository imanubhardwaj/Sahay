import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Attachment from "@/models/Attachment";
import { authenticateRequest } from "@/lib/auth";
import { ATTACHMENT_TYPE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to base64 or upload to a storage service
    // For now, we'll use base64 encoding (in production, use cloud storage like S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Create attachment record
    const attachment = await Attachment.create({
      url: dataUrl, // In production, upload to cloud storage and use the URL
      type: ATTACHMENT_TYPE.Image,
    });

    // Update user's profile picture
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update both profilePictureAttachmentId and avatar for backward compatibility
    user.profilePictureAttachmentId = attachment._id;
    user.avatar = dataUrl; // Also update avatar field for immediate display
    await user.save();

    return NextResponse.json({
      success: true,
      attachmentId: attachment._id,
      avatar: dataUrl,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

