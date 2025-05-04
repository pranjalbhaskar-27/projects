import { NextResponse } from 'next/server';
import { listFiles } from '../../lib/google-drive';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ message: 'Failed to list files' }, { status: 500 });
  }
} 