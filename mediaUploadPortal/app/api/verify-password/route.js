import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Compare with the password set in environment variables
    const correctPassword = process.env.UPLOAD_PASSWORD;
    
    if (password !== correctPassword) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 