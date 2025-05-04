'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Clear any ongoing uploads when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
      } else {
        setMessage(data.message || 'Invalid password. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to verify password. Please try again.');
      console.error('Password verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const files = fileInputRef.current.files;
    
    if (!files || files.length === 0) {
      setMessage('Please select files to upload.');
      return;
    }

    // Cancel any previous upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setLoading(true);
    setMessage('');
    setProgress(0);
    setUploadStatus('uploading');
    setDebugInfo(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    // Use XMLHttpRequest for better upload progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
        console.log(`Upload progress: ${percentComplete}%`);
      }
    };
    
    xhr.onload = function() {
      console.log('XHR onload triggered', xhr.status);
      
      let response;
      try {
        response = JSON.parse(xhr.responseText);
        console.log('Response data:', response);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        response = { message: 'Could not parse server response' };
      }
      
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadStatus('success');
        setMessage(response.message || 'Files uploaded successfully!');
        setDebugInfo(response.files ? `File IDs: ${response.files.map(f => f.id).join(', ')}` : null);
        fileInputRef.current.value = '';
      } else {
        setUploadStatus('error');
        setMessage(response.message || `Error (${xhr.status}): Failed to upload files.`);
        if (response.error) {
          setDebugInfo(`Error details: ${response.error}`);
        }
      }
      
      setLoading(false);
    };
    
    xhr.onerror = function() {
      console.error('Network error during upload');
      setLoading(false);
      setUploadStatus('error');
      setMessage('Network error during upload. Please check your connection and try again.');
    };
    
    xhr.onabort = function() {
      console.log('Upload aborted');
      setLoading(false);
      setUploadStatus('error');
      setMessage('Upload was aborted.');
    };
    
    xhr.open('POST', '/api/upload', true);
    xhr.send(formData);
    
    // Store the XHR in the ref for potential aborting
    abortControllerRef.current = {
      abort: () => xhr.abort()
    };
  };

  // If not logged in
  if (status !== 'loading' && !session) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Access Restricted</h1>
          <p className="text-xl text-gray-600">
            Please sign in to access the upload page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-primary-800 mb-6">Upload Media</h1>
          
          {!verified ? (
            <>
              <p className="text-gray-600 mb-6">
                Please enter the upload password to continue.
              </p>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                {message && (
                  <div className="text-red-500 text-sm mt-2">
                    {message}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Upload your media files to the BSSA Google Drive repository.
              </p>
              
              <form onSubmit={handleFileUpload} className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,video/*"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Select multiple files (images, videos) to upload
                  </p>
                </div>
                
                {uploadStatus === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading: {progress}%
                    </p>
                  </div>
                )}
                
                {message && (
                  <div className={`text-sm mt-2 ${
                    uploadStatus === 'error' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {message}
                  </div>
                )}
                
                {debugInfo && (
                  <div className="text-xs mt-1 text-gray-500">
                    {debugInfo}
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-70"
                  >
                    {loading ? 'Uploading...' : 'Upload Files'}
                  </button>
                  
                  {loading && (
                    <button
                      type="button"
                      onClick={() => {
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                        }
                      }}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
} 