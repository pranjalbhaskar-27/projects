'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          BSSA Media Portal
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-primary-200 transition-colors">
            Home
          </Link>
          <Link href="/gallery" className="hover:text-primary-200 transition-colors">
            Gallery
          </Link>
          {session && (
            <Link href="/upload" className="hover:text-primary-200 transition-colors">
              Upload
            </Link>
          )}
          
          {!loading && !session && (
            <button 
              onClick={() => signIn('google')}
              className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-50 transition-colors"
            >
              Sign In
            </button>
          )}
          
          {session && (
            <div className="flex items-center gap-3">
              <span>{session.user.name}</span>
              <button 
                onClick={() => signOut()}
                className="bg-primary-700 px-4 py-2 rounded-md hover:bg-primary-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
} 