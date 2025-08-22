// src/Pages/NotFoundPage/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 px-4">
    {/* Replace "notfound.png" with your actual image filename */}
    <img
      src="/notfound.png"
      loading='lazy'
      alt="Page Not Found"
      className="max-w-xs md:max-w-md mb-8"
    />
    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-6">
      Oops! We can’t find the page you’re looking for.
    </p>
    <Link
      to="/"
      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition"
    >
      Go Home
    </Link>
  </div>
);

export default NotFoundPage;
