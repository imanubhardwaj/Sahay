import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import Post from "@/models/Post";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/comments - Get all comments (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };

    if (postId) query.postId = postId;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const comments = await Comment.find(query)
      .populate("userId", "firstName lastName email avatar userType")
      .populate("postId", "title content")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Comment.countDocuments(query);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const commentData = await request.json();
    const { userId, postId, ...otherData } = commentData;

    if (!userId || !postId) {
      return NextResponse.json(
        { error: "User ID and Post ID are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    let user = await User.findById(userId);
    if (!user) {
      user = await WorkingProfessional.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = new Comment({
      ...otherData,
      userId,
      postId,
      likes: 0,
    });

    await comment.save();

    // Populate the related data for the response
    await comment.populate(
      "userId",
      "firstName lastName email avatar userType"
    );
    await comment.populate("postId", "title content");

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
