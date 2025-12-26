import { NextResponse } from 'next/server';
import { workos } from '@/lib/workos';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

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
      try {
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
          isOnboardingComplete: true, // Skip onboarding flow
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
      } catch (createError: any) {
        console.error('Error creating user:', createError);
        // If username conflict, try with different random suffix
        if (createError.code === 11000 && createError.keyPattern?.username) {
          console.log('Username conflict, retrying with different username...');
          const firstName = authResponse.user.firstName || authResponse.user.email.split('@')[0];
          const lastName = authResponse.user.lastName || 'User';
          const username = authResponse.user.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 8);
          
          dbUser = await User.create({
            firstName,
            lastName,
            email: authResponse.user.email,
            username,
            workosId: authResponse.user.id,
            role: 'student',
            userType: 'student_fresher',
            isOnboardingComplete: true,
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
          });
          isNewUser = true;
          console.log('New user created with retry:', dbUser._id);
        } else {
          throw createError;
        }
      }
    } else {
      console.log('Existing user found:', dbUser._id);
    }

    console.log('User authenticated successfully:', dbUser.email, 'New user:', isNewUser);
    
    // Generate JWT token
    const token = generateToken({
      userId: dbUser._id.toString(),
      email: dbUser.email,
      role: dbUser.role,
    });
    
    // Set session cookie
    const response = NextResponse.json({ 
      message: 'Code verified successfully!', 
      userId: dbUser._id.toString(),
      token, // Send token in response for frontend to store
      isNewUser,
      user: dbUser
    });
    
    // Set cookie for backward compatibility
    response.cookies.set('user_id', dbUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Set token in cookie (optional)
    response.cookies.set('auth_token', token, {
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
