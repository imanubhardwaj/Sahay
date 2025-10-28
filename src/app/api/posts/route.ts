import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import Community from "@/models/Community";
import PostReaction from "@/models/PostReaction";
import PostComment from "@/models/PostComment";

// GET /api/posts - Get all posts (with optional filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    const communityId = searchParams.get("communityId");
    const tags = searchParams.get("tags");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (authorId) query.authorId = authorId;
    if (communityId) query.communityId = communityId;
    if (tags) query.tags = { $in: tags.split(",") };

    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate("authorId", "firstName lastName email avatar userType")
      .populate("communityId", "name")
      .populate("reactions.userId", "firstName lastName")
      .populate("comments.userId", "firstName lastName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const postData = await request.json();
    const { authorId, ...otherData } = postData;

    if (!authorId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    // Verify author exists
    let author = await User.findById(authorId);
    if (!author) {
      author = await WorkingProfessional.findById(authorId);
    }

    if (!author) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      );
    }

    const post = new Post({
      ...otherData,
      authorId,
      reactions: [],
      comments: [],
      views: 0
    });

    await post.save();

    // Populate the author data for the response
    await post.populate("authorId", "firstName lastName email avatar userType");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
