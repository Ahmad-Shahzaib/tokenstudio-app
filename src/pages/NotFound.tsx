// src/pages/NotFound.tsx
import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | TokenStudio"
        description="The page you're looking for doesn't exist."
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-purple-200 text-center mb-8">
          The page you're looking for might have been removed or doesn't exist.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition text-white"
        >
          Return to Home
        </Link>
      </div>
    </>
  );
}

export default NotFound;