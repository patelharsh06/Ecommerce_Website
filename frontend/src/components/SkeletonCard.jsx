// src/components/SkeletonCard.jsx
import React from "react";

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl shadow-card overflow-hidden">
    <div className="h-40 bg-gray-300" />
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-300 rounded w-1/2" />
    </div>
  </div>
);

export default SkeletonCard;
