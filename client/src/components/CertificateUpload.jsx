import React, { useCallback, useRef } from 'react';
import { useProviderContext } from '../contexts/ProviderContext';
import { uploadCertificate } from '../api/provider';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FileUploader = ({ 
  label, 
  accept = ".json", 
  onChange, 
  disabled = false, 
  isProcessed = false,
  error = null,
  fileName = null,
  fileInputRef
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-lg font-semibold text-gray-700 mb-2">{label}</label>
      {!isProcessed ? (
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={disabled}
          className={`px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          Upload {label}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{fileName || 'File uploaded'}</span>
        </div>
      )}
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        ref={fileInputRef}
        className="hidden"
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-pulse">{error}</p>
      )}
    </div>
  );
};

export default function CertificateUpload({ onNext }) {
  const { certificateFile, processCertificate, errors } = useProviderContext();
  const fileInputRef = useRef(null);

  const handleCertificateUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processCertificate(file);
    } else {
      toast.error('Please upload a valid JSON file.');
    }
  }, [processCertificate]);

  const handleCertificateSubmit = async () => {
    if (!certificateFile) {
      toast.error('Please upload a certificate file first.');
      return;
    }
  
    try {
      const certificateJson = JSON.parse(await certificateFile.text());
      await uploadCertificate(certificateJson);
      toast.success('Certificate uploaded successfully!');
      onNext();
    } catch (error) {
      console.error(error);
      toast.error('Certificate upload failed!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-800">Upload Certificate</h3>
      <FileUploader
        label="Certificate (JSON)"
        accept=".json"
        onChange={handleCertificateUpload}
        isProcessed={!!certificateFile}
        error={errors?.certificate}
        fileName={certificateFile?.name}
        fileInputRef={fileInputRef}
      />
      {certificateFile && (
        <button
          onClick={handleCertificateSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          Submit Certificate
        </button>
      )}
    </div>
  );
}