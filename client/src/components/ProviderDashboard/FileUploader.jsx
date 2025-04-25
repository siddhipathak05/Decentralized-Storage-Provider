import React from 'react';

const FileUploader = ({ 
  label, 
  accept = ".json", 
  onChange, 
  disabled = false, 
  isProcessed = false,
  error = null
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className={`w-full border p-2 rounded-lg ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : ''}`}
        disabled={disabled}
      />
      {isProcessed && (
        <p className="mt-2 text-sm text-green-600">
          <span className="mr-1">✓</span>
          Successfully processed
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUploader;
