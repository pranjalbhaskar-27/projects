'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function ForceSignOut() {
  useEffect(() => {
    // Force sign out to get a new token with updated scopes
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Signing Out...</h1>
        <p className="text-gray-600 mb-6">
          We've updated the permissions for Google Drive access. 
          You'll be signed out and redirected to sign in again with the correct permissions.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
} 