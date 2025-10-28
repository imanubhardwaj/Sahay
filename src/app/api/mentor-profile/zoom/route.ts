import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MentorProfile from '@/models/MentorProfile';
import { exchangeCodeForToken, getZoomUser, getZoomAuthorizationUrl } from '@/lib/zoom';

// GET - Get Zoom authorization URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate authorization URL with state containing userId
    const authUrl = getZoomAuthorizationUrl(userId);

    return NextResponse.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error('Error generating Zoom auth URL:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

// POST - Connect Zoom account
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { success: false, error: 'Code and user ID are required' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Failed to exchange code for tokens' },
        { status: 400 }
      );
    }

    // Get Zoom user info
    const zoomUser = await getZoomUser(tokens.accessToken);
    if (!zoomUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to get Zoom user information' },
        { status: 400 }
      );
    }

    // Update mentor profile with Zoom credentials
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expiresIn);

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          zoomConnected: true,
          zoomAccessToken: tokens.accessToken,
          zoomRefreshToken: tokens.refreshToken,
          zoomTokenExpiry: expiryDate,
          zoomUserId: zoomUser.id,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        zoomUserId: zoomUser.id,
        email: zoomUser.email,
      },
      message: 'Zoom account connected successfully',
    });
  } catch (error) {
    console.error('Error connecting Zoom account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect Zoom account' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect Zoom account
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const mentorProfile = await MentorProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          zoomConnected: false,
          zoomAccessToken: null,
          zoomRefreshToken: null,
          zoomTokenExpiry: null,
          zoomUserId: null,
        },
      },
      { new: true }
    );

    if (!mentorProfile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Zoom account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Zoom account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Zoom account' },
      { status: 500 }
    );
  }
}

