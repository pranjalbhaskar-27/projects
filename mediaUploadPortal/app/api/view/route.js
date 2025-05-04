import { NextResponse } from 'next/server';
import { getFile } from '../../lib/google-drive';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json({ message: 'File ID is required' }, { status: 400 });
    }
    
    const response = await getFile(fileId);
    
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.data) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Set appropriate headers for viewing
    const headers = new Headers();
    headers.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json({ message: 'Failed to view file' }, { status: 500 });
  }
} 