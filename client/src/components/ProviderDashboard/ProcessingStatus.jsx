import React from 'react';

const ProcessingStatus = ({ 
  title, 
  isProcessed, 
  description = null
}) => {
  if (!isProcessed) return null;
  
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
      <p className="text-green-700 font-semibold">
        <span className="mr-1">✓</span>
        {title}
      </p>
      {description && (
        <p className="text-green-600 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

export default ProcessingStatus;
