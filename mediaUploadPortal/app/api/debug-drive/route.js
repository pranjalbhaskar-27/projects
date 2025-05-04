import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    console.log('Debug Drive API route called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        error: 'Not authenticated', 
        success: false 
      }, { status: 401 });
    }
    
    if (!session.accessToken) {
      return NextResponse.json({ 
        error: 'No access token available', 
        success: false 
      }, { status: 401 });
    }
    
    // Get folder ID
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    // Create OAuth client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });
    
    // Get token info
    let tokenInfo = null;
    let tokenError = null;
    try {
      tokenInfo = await oauth2Client.getTokenInfo(session.accessToken);
      console.log('Token info successfully retrieved');
    } catch (error) {
      console.error('Error getting token info:', error);
      tokenError = {
        message: error.message,
        code: error.code
      };
    }
    
    // Create Drive client
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Test basic Drive API access
    let basicAccess = false;
    let basicAccessError = null;
    try {
      console.log('Testing basic Drive API access');
      const aboutResponse = await drive.about.get({
        fields: 'user'
      });
      basicAccess = true;
      console.log('Basic Drive API access is working');
    } catch (error) {
      console.error('Basic Drive API access failed:', error);
      basicAccessError = {
        message: error.message,
        code: error.code,
        errors: error.errors
      };
    }
    
    // Only proceed if we have basic access
    if (!basicAccess) {
      return NextResponse.json({
        success: false,
        auth: {
          email: session.user?.email,
          tokenInfo: tokenInfo ? {
            scope: tokenInfo.scope,
            email: tokenInfo.email,
            expires_in: tokenInfo.expires_in
          } : null,
          tokenError
        },
        basicAccess,
        basicAccessError,
        error: 'Cannot access Google Drive API. Please sign out and sign in again.'
      });
    }
    
    // Check folder existence and access
    let folderInfo = null;
    let folderError = null;
    try {
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType,capabilities,permissions'
      });
      folderInfo = folderResponse.data;
    } catch (error) {
      folderError = {
        code: error.code,
        message: error.message,
        errors: error.errors
      };
    }
    
    // Check if user can create files in root
    let canWriteToRoot = false;
    let rootError = null;
    try {
      const testFile = await drive.files.create({
        requestBody: {
          name: 'test_file.txt',
          mimeType: 'text/plain'
        },
        media: {
          mimeType: 'text/plain',
          body: 'test'
        },
        fields: 'id'
      });
      
      canWriteToRoot = true;
      
      // Clean up test file
      await drive.files.delete({
        fileId: testFile.data.id
      });
    } catch (error) {
      rootError = {
        code: error.code,
        message: error.message,
        errors: error.errors
      };
    }
    
    // Try to get user info
    let userInfo = null;
    try {
      const people = google.people({ version: 'v1', auth: oauth2Client });
      const userResponse = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names'
      });
      userInfo = userResponse.data;
    } catch (error) {
      // Just ignore if we can't get user info
    }
    
    return NextResponse.json({
      success: true,
      auth: {
        email: session.user?.email,
        tokenInfo: tokenInfo ? {
          scope: tokenInfo.scope,
          email: tokenInfo.email,
          expires_in: tokenInfo.expires_in
        } : null,
        tokenError
      },
      basicAccess,
      folder: {
        id: folderId,
        exists: !!folderInfo,
        info: folderInfo,
        error: folderError
      },
      permissions: {
        canWriteToRoot,
        rootError
      },
      userInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug Drive API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 