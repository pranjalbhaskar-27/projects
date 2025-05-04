import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function checkGoogleDriveAccess() {
  try {
    console.log('Running Google Drive diagnostics...');
    const diagnosticResults = {
      session: false,
      accessToken: false,
      basicDriveAccess: false,
      folderExists: false,
      folderAccessible: false,
      canWriteToRoot: false,
      canWriteToFolder: false,
      errors: []
    };

    // 1. Check session
    console.log('Checking for session...');
    const session = await getServerSession(authOptions);
    if (!session) {
      diagnosticResults.errors.push('No session found - please sign in');
      return diagnosticResults;
    }
    diagnosticResults.session = true;
    
    // 2. Check access token
    console.log('Checking for access token...');
    if (!session.accessToken) {
      diagnosticResults.errors.push('No access token in session - please sign out and sign in again');
      return diagnosticResults;
    }
    diagnosticResults.accessToken = true;
    
    // 3. Create Drive client
    console.log('Creating Drive client...');
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // 4. Test basic Drive access (list files)
    try {
      console.log('Testing basic Drive access...');
      const response = await drive.files.list({
        pageSize: 5,
        fields: 'files(id, name)'
      });
      console.log(`Basic access successful - found ${response.data.files.length} files`);
      diagnosticResults.basicDriveAccess = true;
    } catch (error) {
      console.error('Basic Drive access failed:', error);
      diagnosticResults.errors.push(`Cannot access Drive API: ${error.message}`);
      return diagnosticResults;
    }
    
    // 5. Check if folder exists and is accessible
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log(`Testing folder access with ID: ${folderId}`);
    
    try {
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType'
      });
      
      console.log('Folder exists:', folderResponse.data);
      diagnosticResults.folderExists = true;
      
      // Check if it's actually a folder
      if (folderResponse.data.mimeType !== 'application/vnd.google-apps.folder') {
        diagnosticResults.errors.push(`ID ${folderId} exists but is not a folder`);
      }
    } catch (error) {
      console.error('Folder access failed:', error);
      diagnosticResults.errors.push(`Cannot access folder with ID ${folderId}: ${error.message}`);
      return diagnosticResults;
    }
    
    // 6. Try to list files in the folder
    try {
      const folderContentsResponse = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name)'
      });
      
      console.log(`Folder access successful - found ${folderContentsResponse.data.files.length} files in folder`);
      diagnosticResults.folderAccessible = true;
    } catch (error) {
      console.error('Listing folder contents failed:', error);
      diagnosticResults.errors.push(`Cannot list contents of folder: ${error.message}`);
    }
    
    // 7. Test write access to root
    try {
      console.log('Testing write access to root...');
      const testFileResponse = await drive.files.create({
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
      
      console.log('Successfully created test file in root:', testFileResponse.data.id);
      diagnosticResults.canWriteToRoot = true;
      
      // Clean up test file
      await drive.files.delete({
        fileId: testFileResponse.data.id
      });
      console.log('Test file deleted');
    } catch (error) {
      console.error('Write to root failed:', error);
      diagnosticResults.errors.push(`Cannot write to Drive root: ${error.message}`);
    }
    
    // 8. Test write access to folder
    try {
      console.log(`Testing write access to folder ${folderId}...`);
      const testFolderFileResponse = await drive.files.create({
        requestBody: {
          name: 'test_folder_file.txt',
          mimeType: 'text/plain',
          parents: [folderId]
        },
        media: {
          mimeType: 'text/plain',
          body: 'folder test'
        },
        fields: 'id'
      });
      
      console.log('Successfully created test file in folder:', testFolderFileResponse.data.id);
      diagnosticResults.canWriteToFolder = true;
      
      // Clean up test folder file
      await drive.files.delete({
        fileId: testFolderFileResponse.data.id
      });
      console.log('Test folder file deleted');
    } catch (error) {
      console.error('Write to folder failed:', error);
      diagnosticResults.errors.push(`Cannot write to folder: ${error.message}`);
    }
    
    console.log('Diagnostics completed:', diagnosticResults);
    return diagnosticResults;
  } catch (error) {
    console.error('Diagnostic error:', error);
    return {
      errors: [`Diagnostic failure: ${error.message}`]
    };
  }
} 