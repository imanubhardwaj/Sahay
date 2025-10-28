import { NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    
    console.log('Code verification request for email:', email);
    console.log('Code:', code);
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Authenticate with WorkOS using the code
    const authResponse = await workos.userManagement.authenticateWithMagicAuth({
      code,
      email,
      clientId: process.env.WORKOS_CLIENT_ID!,
    });

    console.log('WorkOS user authenticated:', authResponse.user.email);

    // Connect to MongoDB
    await connectDB();

    // Check if user exists
    let dbUser = await User.findOne({ workosId: authResponse.user.id });
    let isNewUser = false;

    if (!dbUser) {
      console.log('Creating new user...');
      // Create new user with all required fields
      const firstName = authResponse.user.firstName || authResponse.user.email.split('@')[0];
      const lastName = authResponse.user.lastName || 'User'; // Provide default last name
      const username = authResponse.user.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: authResponse.user.email,
        username: username,
        workosId: authResponse.user.id,
        role: 'student',
        userType: 'student_fresher',
        isOnboardingComplete: false,
        status: 'active',
        bio: '',
        yoe: 0,
        title: '',
        location: '',
        visibility: 'public',
        skills: [],
        portfolio: [],
        mentors: [],
        progress: {
          currentGoal: '',
          completionRate: 0
        },
        completionRate: 0,
        selectedModules: []
      };
      console.log('User data to create:', userData);
      
      dbUser = await User.create(userData);
      isNewUser = true;
      console.log('New user created successfully:', dbUser._id);
    } else {
      console.log('Existing user found:', dbUser._id);
    }

    console.log('User authenticated successfully:', dbUser.email, 'New user:', isNewUser);
    
    // Set session cookie
    const response = NextResponse.json({ 
      message: 'Code verified successfully!', 
      userId: dbUser._id.toString(),
      isNewUser,
      user: dbUser
    });
    
    response.cookies.set('user_id', dbUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json({ 
      error: 'Invalid verification code', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 400 });
  }
}
