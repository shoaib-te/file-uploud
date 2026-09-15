import jwt from 'jsonwebtoken'; 
import { NextRequest } from 'next/server'; 

export async function getSessionTokenId(request: NextRequest): Promise<string | null> {
  try {
    // 1. Extract the token string safely from cookies
    const token = request.cookies.get('token')?.value || null; 

    if (!token) return null;

    // 2. Verify and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }; 
    
    return decoded.id;
  } catch (error) {
    // Returns null if token is expired, tampered with, or invalid
    console.error('JWT verification failed:', error);
    return null;
  }
}
