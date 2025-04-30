import React, { useCallback, useRef } from 'react';
import { useProviderContext } from '../contexts/ProviderContext';
import { uploadProviderData } from '../api/provider';
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

const ProcessingStatus = ({ 
  title, 
  isProcessed, 
  description = null
}) => {
  if (!isProcessed) return null;
  
  return (
    <div className="bg-green-100 p-4 rounded-xl text-green-700 transition-all duration-300">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <p className="font-semibold">{title}</p>
      </div>
      {description && (
        <p className="text-sm mt-2">{description}</p>
      )}
    </div>
  );
};

export default function DataProcessing({ onNext, onPrev }) {
  const {
    certificateFile, dataFile, alphaFile, tagProofGenWasmFile, zkeyFile,
    dataHash, alphaHash, metaData, tagProofGenInput, witnessBuffer,
    tagProofJson, tagProofPublicJson, isProcessing, errors, isReadyForSubmission,
    processData, processAlpha, processTagProofGenWasm, processZkeyFile
  } = useProviderContext();

  const dataFileInputRef = useRef(null);
  const alphaFileInputRef = useRef(null);
  const wasmFileInputRef = useRef(null);
  const zkeyFileInputRef = useRef(null);

  const handleDataUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processData(file);
    } else {
      toast.error('Please upload a valid JSON file.');
    }
  }, [processData]);

  const handleAlphaUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processAlpha(file);
    } else {
      toast.error('Please upload a valid JSON file.');
    }
  }, [processAlpha]);

  const handleTagProofGenWasmUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processTagProofGenWasm(file);
    } else {
      toast.error('Please upload a valid WASM file.');
    }
  }, [processTagProofGenWasm]);

  const handleZkeyUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processZkeyFile(file);
    } else {
      toast.error('Please upload a valid zkey file.');
    }
  }, [processZkeyFile]);

  
const handleSubmit = async () => {
  if (!isReadyForSubmission) {
    toast.error('Please upload all required files and ensure processing is complete.');
    return;
  }

  try {
    const response = await uploadProviderData({
      dataHash,
      alphaHash,
      metaData,
      tagProofJson,
      tagProofPublicJson
    });

    if (response.data.success) {
      toast.success(response.data.message);
      onNext();
    } else {
      toast.error(responsed.data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occured');
  }
};


  const downloadWitnessBuffer = () => {
    if (!witnessBuffer) return;
    
    const blob = new Blob([witnessBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'witness.wtns';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadProofJson = () => {
    if (!tagProofJson) return;
    
    const blob = new Blob([JSON.stringify(tagProofJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proof.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadPublicJson = () => {
    if (!tagProofPublicJson) return;
    
    const blob = new Blob([JSON.stringify(tagProofPublicJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'public.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-800">Data Processing</h3>
      
      <FileUploader
        label="Data File (JSON)"
        accept=".json"
        onChange={handleDataUpload}
        disabled={!certificateFile}
        isProcessed={!!dataHash}
        error={errors?.data}
        fileName={dataFile?.name}
        fileInputRef={dataFileInputRef}
      />
      
      <FileUploader
        label="Alpha File (JSON)"
        accept=".json"
        onChange={handleAlphaUpload}
        isProcessed={!!alphaHash}
        error={errors?.alpha}
        fileName={alphaFile?.name}
        fileInputRef={alphaFileInputRef}
      />
      
      <ProcessingStatus
        title="Metadata Generated"
        isProcessed={!!metaData}
      />
      
      <ProcessingStatus
        title="Tag Proof Input Prepared"
        isProcessed={!!tagProofGenInput}
        description="All data has been processed and prepared."
      />
      
      {tagProofGenInput && (
        <FileUploader
          label="TagProofGen WASM File"
          accept=".wasm"
          onChange={handleTagProofGenWasmUpload}
          isProcessed={!!tagProofGenWasmFile}
          error={errors?.tagProofGenWasm}
          fileName={tagProofGenWasmFile?.name}
          fileInputRef={wasmFileInputRef}
        />
      )}
      
      {witnessBuffer && (
        <div className="bg-green-100 p-4 rounded-xl text-green-700 transition-all duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Witness Generation Complete</p>
          </div>
          <button
            onClick={downloadWitnessBuffer}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-105"
          >
            Download Witness File
          </button>
        </div>
      )}
      
      {errors?.witness && (
        <div className="bg-red-100 p-4 rounded-xl text-red-700 transition-all duration-300">
          <p className="font-semibold">Witness Generation Error</p>
          <p className="text-sm">{errors.witness}</p>
        </div>
      )}
      
      {witnessBuffer && (
        <FileUploader
          label="circuit_final.zkey File"
          accept=".zkey"
          onChange={handleZkeyUpload}
          isProcessed={!!zkeyFile}
          error={errors?.zkey}
          fileName={zkeyFile?.name}
          fileInputRef={zkeyFileInputRef}
        />
      )}
      
      {tagProofJson && tagProofPublicJson && (
        <div className="bg-green-100 p-4 rounded-xl text-green-700 transition-all duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Proof Generation Complete</p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={downloadProofJson}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-105"
            >
              Download Proof
            </button>
            <button
              onClick={downloadPublicJson}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-105"
            >
              Download Public
            </button>
          </div>
        </div>
      )}
      
      {errors?.proof && (
        <div className="bg-red-100 p-4 rounded-xl text-red-700 transition-all duration-300">
          <p className="font-semibold">Proof Generation Error</p>
          <p className="text-sm">{errors.proof}</p>
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isReadyForSubmission || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Submit Data'}
      </button>
    </div>
  );
}
