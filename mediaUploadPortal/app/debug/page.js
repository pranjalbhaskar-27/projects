'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runDiagnostics() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug-drive');
      const data = await response.json();
      setDiagnosticData(data);
    } catch (err) {
      setError(err.message || 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    signOut({ callbackUrl: '/auth/signin' });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Google Drive Diagnostics</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {status === 'loading' ? (
          <p>Loading session...</p>
        ) : status === 'authenticated' ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-semibold mr-3">
                Authenticated
              </div>
              <span>{session.user?.email}</span>
            </div>
            <div className="space-x-4">
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
              >
                {loading ? 'Running...' : 'Run Diagnostics'}
              </button>
              <button
                onClick={handleSignOut}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
              >
                Sign Out and Refresh Permissions
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-sm font-semibold mr-3">
                Not Authenticated
              </div>
            </div>
            <button
              onClick={() => signIn('google')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {diagnosticData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Results</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Authentication</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Email:</strong> {diagnosticData.auth.email}</p>
              
              {diagnosticData.auth.tokenInfo ? (
                <>
                  <p><strong>Token scopes:</strong> {diagnosticData.auth.tokenInfo.scope || 'No scopes found'}</p>
                  <p><strong>Token expires in:</strong> {diagnosticData.auth.tokenInfo.expires_in || 'Unknown'} seconds</p>
                </>
              ) : (
                <div className="text-red-600 mt-2">
                  <p><strong>Token info unavailable</strong></p>
                  {diagnosticData.auth.tokenError && (
                    <p><strong>Error:</strong> {diagnosticData.auth.tokenError.message}</p>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <p>
                  <strong>Drive API access:</strong>
                  {diagnosticData.basicAccess ? (
                    <span className="text-green-600 ml-2">Working</span>
                  ) : (
                    <span className="text-red-600 ml-2">Failed</span>
                  )}
                </p>
                
                {!diagnosticData.basicAccess && diagnosticData.basicAccessError && (
                  <div className="text-red-600 mt-2">
                    <p><strong>Error:</strong> {diagnosticData.basicAccessError.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {diagnosticData.folder && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Folder Configuration</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>Folder ID:</strong> {diagnosticData.folder.id}</p>
                <p>
                  <strong>Status:</strong> 
                  {diagnosticData.folder.exists ? (
                    <span className="text-green-600">Folder exists and is accessible</span>
                  ) : (
                    <span className="text-red-600">Folder does not exist or is not accessible</span>
                  )}
                </p>
                
                {diagnosticData.folder.exists && diagnosticData.folder.info && (
                  <div className="mt-2">
                    <p><strong>Folder Name:</strong> {diagnosticData.folder.info.name}</p>
                    <p><strong>Type:</strong> {diagnosticData.folder.info.mimeType}</p>
                    <div className="mt-2">
                      <p className="font-semibold">Capabilities:</p>
                      <ul className="list-disc list-inside pl-4">
                        {Object.entries(diagnosticData.folder.info.capabilities || {}).map(([capability, value]) => (
                          <li key={capability} className={value ? 'text-green-600' : 'text-red-600'}>
                            {capability}: {value ? 'Yes' : 'No'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {diagnosticData.folder.error && (
                  <div className="mt-2 text-red-600">
                    <p><strong>Error:</strong> {diagnosticData.folder.error.message}</p>
                    <p><strong>Code:</strong> {diagnosticData.folder.error.code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {diagnosticData.permissions && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Permissions</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>
                  <strong>Can write to Drive root:</strong> 
                  {diagnosticData.permissions.canWriteToRoot ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </p>
                
                {!diagnosticData.permissions.canWriteToRoot && diagnosticData.permissions.rootError && (
                  <div className="mt-2 text-red-600">
                    <p><strong>Error:</strong> {diagnosticData.permissions.rootError.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <h3 className="text-lg font-semibold mb-2">Troubleshooting Steps</h3>
            <ul className="list-disc list-inside space-y-2">
              {!diagnosticData.basicAccess && (
                <li>
                  <strong>Google Drive API access not working</strong>: Your current authentication token doesn't have proper permissions.
                  <div className="mt-1 text-sm">
                    Please sign out and sign in again. Make sure the Google Drive API is enabled in your Google Cloud Console.
                  </div>
                </li>
              )}
            
              {diagnosticData.folder && !diagnosticData.folder.exists && (
                <li>
                  <strong>Invalid folder ID</strong>: Check that your GOOGLE_DRIVE_FOLDER_ID environment variable 
                  contains just the folder ID, not the full URL.
                  <div className="mt-1 text-sm text-gray-600">
                    Example: From <code>https://drive.google.com/drive/folders/1OSv9eRahC8MPh3sxjCvJQDkJiKqii7N6?usp=drive_link</code>, 
                    you should only use <code>1OSv9eRahC8MPh3sxjCvJQDkJiKqii7N6</code>
                  </div>
                </li>
              )}
              
              {diagnosticData.folder && diagnosticData.folder.exists && diagnosticData.folder.info?.capabilities?.canEdit === false && (
                <li>
                  <strong>Insufficient folder permissions</strong>: You need Editor access to the folder to upload files.
                  <div className="mt-1 text-sm">
                    Go to Google Drive, right-click on the folder, select "Share", and ensure your account has Editor access.
                  </div>
                </li>
              )}
              
              {diagnosticData.permissions && !diagnosticData.permissions.canWriteToRoot && (
                <li>
                  <strong>Drive API access issue</strong>: Your account doesn't have permission to write to Google Drive.
                  <div className="mt-1 text-sm">
                    Make sure the Google Drive API is enabled in the Google Cloud Console, and that your email 
                    is added as a test user in the OAuth consent screen settings.
                  </div>
                </li>
              )}
              
              {diagnosticData.auth.tokenInfo && !diagnosticData.auth.tokenInfo.scope?.includes('https://www.googleapis.com/auth/drive') && (
                <li>
                  <strong>Missing Drive scope</strong>: Your authentication token doesn't have the required Drive scopes.
                  <div className="mt-1 text-sm">
                    Click "Sign Out and Refresh Permissions" above, then sign in again to get a new token with the correct scopes.
                  </div>
                </li>
              )}
              
              {!diagnosticData.auth.tokenInfo && (
                <li>
                  <strong>Token validation failed</strong>: There was an issue validating your authentication token.
                  <div className="mt-1 text-sm">
                    Click "Sign Out and Refresh Permissions" above, then sign in again to get a new token.
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 