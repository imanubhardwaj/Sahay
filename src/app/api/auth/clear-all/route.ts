import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'All data cleared successfully' 
    });

    // Clear all possible cookies
    const cookiesToClear = ['user_id', 'session', 'auth', 'token', 'workos_session'];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
        path: '/'
      });
    });

    return response;
  } catch (error) {
    console.error('Clear all error:', error);
    return NextResponse.json(
      { success: false, error: 'Clear failed' },
      { status: 500 }
    );
  }
}
