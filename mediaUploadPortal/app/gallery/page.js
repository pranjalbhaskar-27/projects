'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function GalleryPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  const [thumbnailLoading, setThumbnailLoading] = useState({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      window.open(`/api/download?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}`, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const openPreview = (file) => {
    setSelectedFile(file);
  };

  const closePreview = () => {
    setSelectedFile(null);
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  };

  const getFileIcon = (mimeType) => {
    const type = getFileType(mimeType);
    
    if (type === 'image') return '🖼️';
    if (type === 'video') return '🎬';
    return '📄';
  };

  const handleThumbnailError = (fileId) => {
    setThumbnailErrors(prev => ({
      ...prev,
      [fileId]: true
    }));
    setThumbnailLoading(prev => ({
      ...prev,
      [fileId]: false
    }));
  };

  const handleThumbnailLoad = (fileId) => {
    setThumbnailLoading(prev => ({
      ...prev,
      [fileId]: false
    }));
  };

  const startThumbnailLoad = (fileId) => {
    setThumbnailLoading(prev => ({
      ...prev,
      [fileId]: true
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary-800 mb-6">Media Gallery</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No files found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div 
                  className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => openPreview(file)}
                  onMouseEnter={() => getFileType(file.mimeType) === 'image' && startThumbnailLoad(file.id)}
                >
                  {getFileType(file.mimeType) === 'image' && !thumbnailErrors[file.id] ? (
                    <>
                      {thumbnailLoading[file.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <div className="w-8 h-8 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={`/api/thumbnail?fileId=${file.id}&t=${Date.now()}`}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={() => handleThumbnailError(file.id)}
                        onLoad={() => handleThumbnailLoad(file.id)}
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="text-4xl flex flex-col items-center justify-center">
                      {getFileIcon(file.mimeType)}
                      <span className="text-sm mt-2 text-gray-500">{file.name.split('.').pop().toUpperCase()}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </p>
                  
                  <button
                    onClick={() => handleDownload(file.id, file.name)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-screen">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 z-10"
            >
              ✕
            </button>
            
            <div className="bg-white p-4 rounded-lg overflow-auto max-h-[90vh]">
              <h3 className="text-xl font-medium text-gray-800 mb-4">{selectedFile.name}</h3>
              
              {getFileType(selectedFile.mimeType) === 'image' ? (
                <div className="relative min-h-[300px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
                  </div>
                  <img
                    src={`/api/view?fileId=${selectedFile.id}&t=${Date.now()}`}
                    alt={selectedFile.name}
                    className="max-w-full max-h-[70vh] mx-auto relative z-10"
                    onLoad={(e) => e.target.previousSibling.style.display = 'none'}
                  />
                </div>
              ) : getFileType(selectedFile.mimeType) === 'video' ? (
                <video
                  src={`/api/view?fileId=${selectedFile.id}`}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{getFileIcon(selectedFile.mimeType)}</div>
                  <p>Preview not available for this file type.</p>
                </div>
              )}
              
              <div className="mt-4 text-right">
                <button
                  onClick={() => handleDownload(selectedFile.id, selectedFile.name)}
                  className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 