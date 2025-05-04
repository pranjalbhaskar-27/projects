import { NextResponse } from 'next/server';
import { uploadFile } from '../../lib/google-drive';
import { Readable } from 'stream';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

export async function POST(request) {
  console.log('Upload API route called');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session check:', session ? 'Session exists' : 'No session');
    
    if (!session) {
      console.log('Authentication required - no session');
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    
    if (!session.accessToken) {
      console.log('No access token in session');
      return NextResponse.json({ 
        message: 'Google Drive access token not found. Please sign out and sign in again.' 
      }, { status: 403 });
    }
    
    console.log('Starting formData parsing');
    const formData = await request.formData();
    const files = formData.getAll('files');
    console.log(`Found ${files.length} files in formData`);
    
    if (!files || files.length === 0) {
      console.log('No files provided in request');
      return NextResponse.json({ message: 'No files provided' }, { status: 400 });
    }
    
    console.log('Starting file upload processing');
    const uploadResults = [];
    const errors = [];
    
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
        const fileArrayBuffer = await file.arrayBuffer();
        console.log(`Converted file to ArrayBuffer, size: ${fileArrayBuffer.byteLength} bytes`);
        
        const fileBuffer = Buffer.from(fileArrayBuffer);
        console.log(`Converted ArrayBuffer to Buffer, size: ${fileBuffer.length} bytes`);
        
        const fileStream = Readable.from(fileBuffer);
        console.log(`Created readable stream from buffer for file: ${file.name}`);
        
        console.log(`Starting upload to Google Drive: ${file.name}`);
        const result = await uploadFile(fileStream, file.name);
        console.log(`Upload completed for ${file.name}, result:`, result);
        
        uploadResults.push({
          name: file.name,
          id: result.id,
          webViewLink: result.webViewLink || null
        });
        
        console.log(`Successfully processed file: ${file.name} with ID: ${result.id}`);
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        errors.push({
          name: file.name,
          error: fileError.message || 'Unknown error',
          stack: fileError.stack || null
        });
      }
    }
    
    if (uploadResults.length === 0 && errors.length > 0) {
      console.log('All uploads failed:', errors);
      return NextResponse.json({ 
        message: 'Failed to upload all files', 
        errors 
      }, { status: 500 });
    }
    
    const responseData = { 
      message: errors.length > 0 
        ? `Uploaded ${uploadResults.length} files with ${errors.length} errors` 
        : 'Files uploaded successfully',
      files: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    };
    
    console.log('Upload API response:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in upload API route:', error);
    return NextResponse.json({ 
      message: 'Failed to upload files', 
      error: error.message || 'Unknown error',
      stack: error.stack || null
    }, { status: 500 });
  }
} 