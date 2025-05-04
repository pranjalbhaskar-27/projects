import Header from './components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-6">
            BSSA Media Portal
          </h1>
          <p className="text-xl text-gray-700 mb-10">
            A centralized platform for photographers and videographers to upload media, and for users to access and download content.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-primary-600 mb-4">Media Gallery</h2>
              <p className="text-gray-600 mb-6">
                Browse and download high-quality photographs and videos from various BSSA events.
              </p>
              <a href="/gallery" 
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
                View Gallery
              </a>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-primary-600 mb-4">Content Upload</h2>
              <p className="text-gray-600 mb-6">
                Authorized photographers and videographers can upload media directly to our Google Drive repository.
              </p>
              <a href="/upload" 
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
                Upload Media
              </a>
            </div>
          </div>
          
          <div className="mt-12 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Having trouble with uploads?</h3>
            <p className="text-blue-600 mb-4">
              If you're experiencing issues with Google Drive access or file uploads, our diagnostic tool can help identify and resolve the problem.
            </p>
            <a href="/debug" className="text-primary-600 hover:text-primary-800 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Run Google Drive Diagnostic Tool
            </a>
          </div>
        </section>
      </div>
      
      <footer className="bg-gray-100 border-t border-gray-200 mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} BSSA Media Portal. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
} 