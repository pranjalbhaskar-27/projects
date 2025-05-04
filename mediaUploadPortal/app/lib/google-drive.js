import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { OAuth2Client } from 'google-auth-library';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function getGoogleDriveClient(session) {
  if (!session?.accessToken) {
    console.error('No access token found in session');
    throw new Error('No access token found - please sign in again');
  }

  console.log('Creating OAuth2Client with access token');
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  // Skip token verification in development if token info is not available
  // and proceed directly to using the Drive API
  try {
    // Try to get basic Drive service first
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Test if the token works with a simple request
    console.log('Testing token with a basic Drive API request');
    await drive.about.get({
      fields: 'user'
    });
    
    console.log('Token works for Drive API access');
    return drive;
  } catch (error) {
    console.error('Error accessing Drive API:', error);
    
    // If it's a permission error, try to provide more context
    if (error.message && (
      error.message.includes('permission') || 
      error.message.includes('Permission') ||
      error.message.includes('scope') ||
      error.message.includes('OAuth')
    )) {
      console.log('This appears to be a permissions/OAuth issue');
      throw new Error('Google Drive access permission denied - please sign out and sign in again');
    }
    
    // For other errors, just pass them through
    throw error;
  }
}

export async function listFiles() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('No session available for listing files');
      throw new Error('Authentication required');
    }
    
    console.log('Session found, getting Google Drive client');
    const drive = await getGoogleDriveClient(session);
    
    // Verify folder ID exists and is accessible
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log(`Target folder ID: ${folderId}`);
    
    if (!folderId) {
      console.error('No folder ID configured');
      throw new Error('No Google Drive folder ID configured');
    }
    
    // First check if the folder exists and is accessible
    try {
      console.log('Verifying folder existence and permissions');
      const folderCheck = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType'
      });
      
      if (folderCheck.data.mimeType !== 'application/vnd.google-apps.folder') {
        console.error('Target ID is not a folder:', folderCheck.data);
        throw new Error('Configured ID is not a Google Drive folder');
      }
      
      console.log('Folder accessible:', folderCheck.data.name);
    } catch (folderError) {
      console.error('Folder access check failed:', folderError);
      throw new Error(`Cannot access Drive folder: ${folderError.message}`);
    }
    
    // Now list files in the folder
    console.log('Listing files in folder');
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, modifiedTime, hasThumbnail)',
      orderBy: 'modifiedTime desc',
    });

    console.log(`Successfully listed ${response.data.files.length} files from folder`);
    
    // Process each file to ensure thumbnails are available for images
    const processedFiles = await Promise.all(response.data.files.map(async (file) => {
      // If it's an image and doesn't have a thumbnail, add a thumbnail URL
      if (file.mimeType.startsWith('image/') && !file.thumbnailLink) {
        console.log(`Adding thumbnail URL for image: ${file.name}`);
        file.thumbnailLink = `/api/thumbnail?fileId=${file.id}`;
      }
      return file;
    }));

    return processedFiles;
  } catch (error) {
    console.error('Error in listFiles:', error);
    // Extract the most useful error information
    const errorDetails = error.errors?.[0] || {};
    console.log('Error details:', JSON.stringify({
      code: errorDetails.code || error.code,
      message: errorDetails.message || error.message,
      reason: errorDetails.reason,
      domain: errorDetails.domain
    }));
    throw error;
  }
}

export async function uploadFile(file, filename) {
  console.log(`Starting upload process for file: ${filename}`);
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!folderId) {
    console.error('No folder ID configured');
    throw new Error('No Google Drive folder ID configured');
  }
  
  console.log(`Using folder ID: ${folderId}`);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('No session found for upload');
      throw new Error('Authentication required');
    }
    
    if (!session.accessToken) {
      console.error('No access token found in session');
      throw new Error('No access token available - please sign out and sign in again');
    }
    
    console.log('Creating Google Drive client');
    const drive = await getGoogleDriveClient(session);

    // First verify folder exists and is accessible
    try {
      console.log('Verifying folder access before upload');
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType'
      });
      
      console.log('Folder confirmed accessible:', folderResponse.data.name);
    } catch (folderError) {
      console.error('Folder access check failed:', folderError);
      // Provide a clear error message based on the error type
      if (folderError.code === 404) {
        throw new Error(`The configured folder ID ${folderId} does not exist`);
      } else if (folderError.code === 403) {
        throw new Error(`You don't have permission to access the configured folder - check folder sharing settings`);
      } else {
        throw new Error(`Cannot access folder: ${folderError.message}`);
      }
    }

    // Now attempt the upload to the specified folder
    console.log('Attempting to upload file to specified folder');
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        body: file,
      },
      fields: 'id,name,mimeType,webViewLink',
    });
    
    console.log('Upload successful, file details:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    
    // Extract the most useful error information
    const errorDetails = error.errors?.[0] || {};
    console.log('Detailed error:', JSON.stringify({
      code: errorDetails.code || error.code,
      message: errorDetails.message || error.message,
      reason: errorDetails.reason,
      domain: errorDetails.domain
    }));
    
    // Handle specific error cases with clear messages
    if (errorDetails.reason === 'insufficientPermissions' || 
        error.message?.includes('permission') || 
        error.message?.includes('Permission')) {
      throw new Error('You do not have permission to upload to this folder. Please check that you have Editor access to the folder.');
    } else if (errorDetails.reason === 'notFound' || error.code === 404) {
      throw new Error('The configured folder ID does not exist or is not accessible.');
    } else {
      throw error;
    }
  }
}

export async function getFile(fileId) {
  const session = await getServerSession(authOptions);
  const drive = await getGoogleDriveClient(session);

  const response = await drive.files.get({
    fileId,
    alt: 'media',
  }, {
    responseType: 'stream',
  });

  return response;
}

export async function getThumbnail(fileId) {
  try {
    console.log(`Getting thumbnail for file: ${fileId}`);
    const session = await getServerSession(authOptions);
    const drive = await getGoogleDriveClient(session);

    // First get the file metadata to check if it's an image
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,thumbnailLink,hasThumbnail'
    });

    const file = fileMetadata.data;
    console.log(`File metadata retrieved: ${file.name}, mime: ${file.mimeType}, hasThumbnail: ${file.hasThumbnail}`);
    
    // If Google Drive already provides a thumbnailLink, use it
    if (file.thumbnailLink) {
      console.log(`Using Google-provided thumbnail: ${file.thumbnailLink}`);
      // Modify the URL to get a larger thumbnail
      return file.thumbnailLink.replace('=s220', '=s500');
    }

    // If it's an image but Google didn't provide a thumbnail, we can use the image itself
    if (file.mimeType.startsWith('image/')) {
      console.log(`File is an image, returning direct image URL`);
      // For images, we can use the image itself as the thumbnail
      return `/api/view?fileId=${fileId}&thumbnail=true`;
    }

    // For non-image files without thumbnails, return null
    console.log(`No thumbnail available for this file`);
    return null;
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    return null;
  }
} 