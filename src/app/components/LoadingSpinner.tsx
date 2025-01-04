// LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-solid border-gray-300 border-t-primary"></div>
    <span className="text-gray-500">Loading...</span>
  </div>
);

export default LoadingSpinner;
