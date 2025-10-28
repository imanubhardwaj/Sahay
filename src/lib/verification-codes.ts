// Simple in-memory store for verification codes (in production, use Redis)
const verificationCodes = new Map<string, { email: string; expires: number }>();

export function generateVerificationCode(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  verificationCodes.set(code, { email, expires });
  
  // Clean up expired codes
  for (const [storedCode, data] of verificationCodes.entries()) {
    if (data.expires < Date.now()) {
      verificationCodes.delete(storedCode);
    }
  }
  
  return code;
}

export function verifyCode(code: string, email: string): boolean {
  const storedCode = verificationCodes.get(code);
  
  if (!storedCode || storedCode.email !== email || storedCode.expires < Date.now()) {
    return false;
  }
  
  // Remove the used code
  verificationCodes.delete(code);
  return true;
}

export function getCodeInfo(code: string): { email: string; expires: number } | null {
  return verificationCodes.get(code) || null;
}
