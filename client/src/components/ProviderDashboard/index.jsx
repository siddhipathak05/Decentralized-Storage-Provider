import React, { useCallback } from 'react';
import { useProviderContext } from '../../contexts/ProviderContext';
import { uploadProviderData, uploadCertificate } from '../../api/provider';
import FileUploader from './FileUploader';
import ProcessingStatus from './ProcessingStatus';

export default function ProviderDashboard() {
  const {
    // Files and processed data
    certificateFile, dataFile, alphaFile, tagProofGenWasmFile, zkeyFile,
    dataJson, dataHash, alphaJson, alphaHash,
    metaData, tagProofGenInput, witnessBuffer,
    tagProofJson, tagProofPublicJson,
    
    // Status
    isProcessing, errors, isReadyForSubmission,
    
    // Functions
    processCertificate, processData, processAlpha, 
    processTagProofGenWasm, processZkeyFile
  } = useProviderContext();

  const handleCertificateUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processCertificate(file);
    }
  }, [processCertificate]);

  const handleDataUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processData(file);
    }
  }, [processData]);

  const handleAlphaUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      processAlpha(file);
    }
  }, [processAlpha]);

  const handleTagProofGenWasmUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processTagProofGenWasm(file);
    }
  }, [processTagProofGenWasm]);

  const handleZkeyUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processZkeyFile(file);
    }
  }, [processZkeyFile]);

  const handleCertificateSubmit = async () => {
    if (!certificateFile) {
      alert('Please upload a certificate file first.');
      return;
    }
  
    try {
      const certificateJson = JSON.parse(await certificateFile.text());
      const response = await uploadCertificate(certificateJson);
      alert('Certificate uploaded successfully!');
      console.log(response.data);
    } catch (error) {
      console.error(error);
      alert('Certificate upload failed!');
    }
  };

  const handleSubmit = async () => {
    if (!isReadyForSubmission) {
      alert('Please upload all required files and ensure processing is complete.');
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
      
      alert('Upload successful!');
      console.log(response.data);
    } catch (error) {
      console.error(error);
      alert('Upload failed!');
    }
  };

  // Function to save witness buffer as a file
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
  
  // Function to save proof as a file
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
  
  // Function to save public signals as a file
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
    <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-center">Provider Dashboard</h2>
      
      <FileUploader
        label="Upload Certificate (JSON)"
        onChange={handleCertificateUpload}
        isProcessed={!!certificateFile}
        error={errors?.certificate}
      />

      {certificateFile && (
        <button
          onClick={handleCertificateSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition mt-2"
        >
          Upload Certificate to Server
        </button>
      )}
      
      <FileUploader
        label="Upload Data File (JSON)"
        onChange={handleDataUpload}
        disabled={!certificateFile}
        isProcessed={!!dataHash}
        error={errors?.data}
      />
      
      <FileUploader
        label="Upload Alpha File (JSON)"
        onChange={handleAlphaUpload}
        isProcessed={!!alphaHash}
        error={errors?.alpha}
      />
      
      <ProcessingStatus
        title="Metadata successfully generated"
        isProcessed={!!metaData}
      />
      
      <ProcessingStatus
        title="Tag Proof Generation Input prepared"
        isProcessed={!!tagProofGenInput}
        description="All data has been processed and prepared for submission."
      />
      
      {tagProofGenInput && (
        <FileUploader
          label="Upload TagProofGen WASM File"
          accept=".wasm"
          onChange={handleTagProofGenWasmUpload}
          isProcessed={!!tagProofGenWasmFile}
          error={errors?.tagProofGenWasm}
        />
      )}
      
      {witnessBuffer && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">
            <span className="mr-1">✓</span>
            Witness generation complete
          </p>
          <button
            onClick={downloadWitnessBuffer}
            className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
          >
            Download Witness File
          </button>
        </div>
      )}
      
      {errors?.witness && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700 font-semibold">Witness Generation Error</p>
          <p className="text-red-600 text-sm">{errors.witness}</p>
        </div>
      )}
      
      {witnessBuffer && (
        <FileUploader
          label="Upload circuit_final.zkey File"
          accept=".zkey"
          onChange={handleZkeyUpload}
          isProcessed={!!zkeyFile}
          error={errors?.zkey}
        />
      )}
      
      {tagProofJson && tagProofPublicJson && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-green-700 font-semibold">
            <span className="mr-1">✓</span>
            Proof generation complete
          </p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={downloadProofJson}
              className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
            >
              Download Proof
            </button>
            <button
              onClick={downloadPublicJson}
              className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
            >
              Download Public
            </button>
          </div>
        </div>
      )}
      
      {errors?.proof && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700 font-semibold">Proof Generation Error</p>
          <p className="text-red-600 text-sm">{errors.proof}</p>
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isReadyForSubmission || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
}