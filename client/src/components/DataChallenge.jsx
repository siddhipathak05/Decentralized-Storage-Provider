import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { get_seed, uploadProviderChallenge } from '../api/provider';
import { useProviderContext } from '../contexts/ProviderContext';
import { CheckCircle, RefreshCw, Download } from 'lucide-react';

// Define the interval for automatic challenge execution (in milliseconds)
const CHALLENGE_INTERVAL = 60000; // 60 seconds

export default function DataChallenge({ onPrev }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [seed, setSeed] = useState(null);
  const [isIntervalActive, setIsIntervalActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const { 
    processChallenge, 
    responseJson, 
    respProofGenInput, 
    processRespProofGenWasm,
    respProofGenWasmFile,
    respWitnessBuffer,
    processRespZkeyFile,
    respZkeyFile,
    respProofJson,
    respProofPublicJson,
    metaData,
    resetChallenge,
    errors
  } = useProviderContext();

  // Add reference for file input
  const respWasmFileInputRef = useRef(null);
  const respZkeyFileInputRef = useRef(null);


  const handleRespProofGenWasmUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processRespProofGenWasm(file);
    } else {
      toast.error('Please upload a valid WASM file.');
    }
  };

  // Add handler for Circuit2.zkey file upload
  const handleRespZkeyUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processRespZkeyFile(file);
    } else {
      toast.error('Please upload a valid zkey file.');
    }
  };

  const handleSubmitChallenge = async () => {
    if (!metaData || !respProofJson || !respProofPublicJson) {
      toast.error('All proofs must be generated before submission');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await uploadProviderChallenge(metaData, respProofJson, respProofPublicJson);
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error(responsed.data.message);
    }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit challenge response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallenge = async () => {
    setIsProcessing(true);

    try {
      
      const response = await get_seed();
      setSeed(response.data.seed);
      
      // Process the challenge with the seed
      if (response.data.seed) {
        if (metaData && metaData.sigma) {
          console.log(metaData.sigma);
        }
        processChallenge(metaData, response.data.seed);
        toast.success('Response generated successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const startChallenge = () => {
    if (!isIntervalActive) {
      setIsIntervalActive(true);
      handleChallenge(); // Run immediately on button click
      
      // Set up interval
      const id = setInterval(() => {
        if (!isProcessing) {
          handleChallenge();
        }
      }, CHALLENGE_INTERVAL);
      
      setIntervalId(id);
    }
  };

  const stopChallengeInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsIntervalActive(false);
  };

  const resetChallengeState = () => {
    stopChallengeInterval();
    resetChallenge();
    setSeed(null);
    toast.success('Challenge state reset successfully');
  };

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Data Challenge</h3>
        <button
          onClick={resetChallengeState}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Challenge control buttons */}
      <div className="flex gap-4">
        <button
          onClick={startChallenge}
          disabled={isProcessing || isIntervalActive}
          className={`flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
            isProcessing || isIntervalActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Start Challenge'}
        </button>
        
        {isIntervalActive && !isProcessing && (
          <button
            onClick={stopChallengeInterval}
            className="flex-1 bg-red-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:bg-red-600"
          >
            Stop Auto-Challenge
          </button>
        )}
      </div>

      {/* Seed display */}
      {seed && (
        <div className="bg-gray-100 p-4 rounded-xl text-gray-700">
          <p className="font-semibold mb-2">Seed:</p>
          <p>{JSON.stringify(seed)}</p>
        </div>
      )}

      {/* Status indicators */}
      {responseJson && (
        <div className="bg-green-100 p-4 rounded-xl text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Response Generated</p>
          </div>
        </div>
      )}
      
      {respProofGenInput && (
        <div className="bg-green-100 p-4 rounded-xl text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Response Proof Input Prepared</p>
          </div>
        </div>
      )}

      {/* WASM File Upload */}
      {respProofGenInput && (
        <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <label className="text-lg font-semibold text-gray-700 block mb-3">RespProofGen WASM File</label>
          {!respProofGenWasmFile ? (
            <button
              onClick={() => respWasmFileInputRef.current.click()}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-blue-700"
            >
              Upload RespProofGen WASM
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{respProofGenWasmFile.name}</span>
            </div>
          )}
          <input
            type="file"
            accept=".wasm"
            onChange={handleRespProofGenWasmUpload}
            ref={respWasmFileInputRef}
            className="hidden"
          />
          {errors?.respProofGenWasm && (
            <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.respProofGenWasm}</p>
          )}
        </div>
      )}

      {/* Witness Buffer */}
      {respWitnessBuffer && (
        <div className="bg-green-100 p-5 rounded-xl text-green-700 transition-all duration-300 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Response Witness Generation Complete</p>
          </div>
          <button
            onClick={() => downloadFile(respWitnessBuffer, 'response_witness.wtns', 'application/octet-stream')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Download Response Witness File
          </button>
        </div>
      )}

      {errors?.respWitness && (
        <div className="bg-red-100 p-4 rounded-xl text-red-700 transition-all duration-300 mt-4">
          <p className="font-semibold">Response Witness Generation Error</p>
          <p className="text-sm">{errors.respWitness}</p>
        </div>
      )}

      {/* ZKey File Upload */}
      {respWitnessBuffer && (
        <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <label className="text-lg font-semibold text-gray-700 block mb-3">Circuit2.zkey File</label>
          {!respZkeyFile ? (
            <button
              onClick={() => respZkeyFileInputRef.current.click()}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 hover:bg-blue-700"
            >
              Upload Circuit2.zkey
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{respZkeyFile.name}</span>
            </div>
          )}
          <input
            type="file"
            accept=".zkey"
            onChange={handleRespZkeyUpload}
            ref={respZkeyFileInputRef}
            className="hidden"
          />
          {errors?.respZkey && (
            <p className="mt-2 text-sm text-red-600 animate-pulse">{errors.respZkey}</p>
          )}
        </div>
      )}

      {/* Proof Generation Results */}
      {respProofJson && respProofPublicJson && (
        <div className="bg-green-100 p-5 rounded-xl text-green-700 transition-all duration-300 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Response Proof Generation Complete</p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => downloadFile(JSON.stringify(respProofJson, null, 2), 'response_proof.json', 'application/json')}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Download Proof
            </button>
            <button
              onClick={() => downloadFile(JSON.stringify(respProofPublicJson, null, 2), 'response_public.json', 'application/json')}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Download Public
            </button>
          </div>
        </div>
      )}

      {errors?.respProof && (
        <div className="bg-red-100 p-4 rounded-xl text-red-700 transition-all duration-300 mt-4">
          <p className="font-semibold">Response Proof Generation Error</p>
          <p className="text-sm">{errors.respProof}</p>
        </div>
      )}

      {/* Submit Button */}
      {respProofJson && respProofPublicJson && metaData && (
        <button
          onClick={handleSubmitChallenge}
          disabled={isSubmitting}
          className={`w-full mt-6 bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Challenge Response'}
        </button>
      )}
    </div>
  );
}
