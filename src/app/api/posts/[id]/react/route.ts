import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import PostReaction from "@/models/PostReaction";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// POST /api/posts/[id]/react - React to a post (requires auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authenticatedUserId = await authenticateRequest(request);

    await connectDB();

    const body = await request.json();
    const { userId: requestedUserId, reactionType } = body;

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    if (!userId || !reactionType) {
      return NextResponse.json(
        { error: "User ID and reaction type are required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Check if post exists
    const post = await Post.findById(id);
    if (!post || post.deletedAt) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already reacted
    const existingReaction = await PostReaction.findOne({
      postId: id,
      userId,
    });

    if (existingReaction) {
      // Update existing reaction
      existingReaction.reactionType = reactionType;
      await existingReaction.save();
    } else {
      // Create new reaction
      const reaction = new PostReaction({
        postId: id,
        userId,
        reactionType,
      });
      await reaction.save();
    }

    // Update post reaction count
    const reactionCounts = await PostReaction.aggregate([
      { $match: { postId: id } },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ]);

    const reactions: Record<string, number> = {};
    reactionCounts.forEach((item) => {
      reactions[item._id] = item.count;
    });

    await Post.findByIdAndUpdate(id, { reactions });

    return NextResponse.json({ message: "Reaction added successfully" });
  } catch (error) {
    console.error("Error reacting to post:", error);
    return NextResponse.json(
      { error: "Failed to react to post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/react - Remove reaction from a post (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only remove their own reactions
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only remove your own reactions" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Remove reaction
    await PostReaction.findOneAndDelete({
      postId: id,
      userId,
    });

    // Update post reaction count
    const reactionCounts = await PostReaction.aggregate([
      { $match: { postId: id } },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ]);

    const reactions: Record<string, number> = {};
    reactionCounts.forEach((item) => {
      reactions[item._id] = item.count;
    });

    await Post.findByIdAndUpdate(id, { reactions });

    return NextResponse.json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 }
    );
  }
}
