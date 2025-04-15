// File: src/Componenets/PageNotFound.js

import React from 'react';

const PageNotFound = () => {
  return (
    <div

    className="flex justify-center items-center h-screen bg-black text-center">
      <div className="max-w-lg p-8 bg-yellow-400 rounded-lg shadow-lg">

        <h1 className="text-4xl font-bold text-black mb-4">Oops! Page not found.</h1>
        <p className="text-black text-xl mb-6">It seems like the page you're looking for doesn't exist.</p>
        <a href="/" className="text-black font-bold hover:text-yellow-600">Go back to Home</a>
      </div>
    </div>
  );
};

export default PageNotFound;
