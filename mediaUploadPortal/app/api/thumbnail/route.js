import { NextResponse } from 'next/server';
import { getThumbnail } from '../../lib/google-drive';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json({ message: 'File ID is required' }, { status: 400 });
    }
    
    const thumbnailLink = await getThumbnail(fileId);
    
    if (thumbnailLink) {
      if (thumbnailLink.startsWith('/api/')) {
        // If it's our internal URL (for direct images), redirect to it
        return NextResponse.redirect(new URL(thumbnailLink, request.url));
      } else {
        // If it's a Google Drive URL, redirect to it
        return NextResponse.redirect(thumbnailLink);
      }
    } else {
      // Return a fallback image for files without thumbnails
      // Redirect to a placeholder image from public folder
      return NextResponse.redirect(new URL('/placeholder.svg', request.url));
    }
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    // Even on error, return a placeholder to avoid breaking the UI
    return NextResponse.redirect(new URL('/placeholder.svg', request.url));
  }
} 