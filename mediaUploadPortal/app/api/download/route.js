import { NextResponse } from 'next/server';
import { getFile } from '../../lib/google-drive';
import { Readable } from 'stream';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    const fileName = url.searchParams.get('fileName') || 'download';
    
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
    
    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json({ message: 'Failed to download file' }, { status: 500 });
  }
} 