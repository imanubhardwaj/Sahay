import * as jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/User';
import WorkingProfessional from '@/models/WorkingProfessional';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Get user ID from request - checks both token header and cookie (for backward compatibility)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // First, try to get from Authorization header (token)
  const token = extractTokenFromHeader(request);
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      return payload.userId;
    }
  }

  // Fallback to cookie for backward compatibility
  const userId = request.cookies.get('user_id')?.value;
  return userId || null;
}

/**
 * Authenticate request and return user ID
 * Throws error if authentication fails
 */
export async function authenticateRequest(request: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  return userId;
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated or user not found
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    return null;
  }

  // Try to find user in both collections
  const user = await User.findById(userId) || await WorkingProfessional.findById(userId);
  return user;
}

/**
 * Verify token and get user details
 */
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }

  const user = await User.findById(payload.userId) || await WorkingProfessional.findById(payload.userId);
  return user;
}
