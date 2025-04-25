import React, { createContext, useContext, useState, useCallback } from 'react';
import alphaHasher from '../utils/alphaHasher';
import { browserPoseidonHasher } from '../utils/BrowserDataFileHasher';
import tagGenerator from '../utils/tagGenerator';
import Merger from '../utils/merger';
import generateWitness from '../utils/generateWitness';

// Import the snarkjs library for proof generation
import * as snarkjs from 'snarkjs';
import { generateProof, generateProofUsingCliApi } from '../utils/generateProof';

const ProviderContext = createContext(null);

export const useProviderContext = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviderContext must be used within a ProviderContextProvider');
  }
  return context;
};

export const ProviderContextProvider = ({ children }) => {
  // File states
  const [certificateFile, setCertificateFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [alphaFile, setAlphaFile] = useState(null);
  const [tagProofGenWasmFile, setTagProofGenWasmFile] = useState(null);
  const [zkeyFile, setZkeyFile] = useState(null);
  
  // Processed data states
  const [certificateJson, setCertificateJson] = useState(null);
  const [dataJson, setDataJson] = useState(null);
  const [dataHash, setDataHash] = useState(null);
  const [alphaJson, setAlphaJson] = useState(null);
  const [alphaHash, setAlphaHash] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [tagProofGenInput, setTagProofGenInput] = useState(null);
  const [witnessBuffer, setWitnessBuffer] = useState(null);
  const [tagProofJson, setTagProofJson] = useState(null);
  const [tagProofPublicJson, setTagProofPublicJson] = useState(null);
  
  // Processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Reset functions
  const resetData = useCallback(() => {
    setDataFile(null);
    setDataJson(null);
    setDataHash(null);
    setMetaData(null);
    setTagProofGenInput(null);
    setWitnessBuffer(null);
    setTagProofJson(null);
    setTagProofPublicJson(null);
  }, []);
  
  const resetAll = useCallback(() => {
    setCertificateFile(null);
    setCertificateJson(null);
    resetData();
    setAlphaFile(null);
    setAlphaJson(null);
    setAlphaHash(null);
    setTagProofGenWasmFile(null);
    setZkeyFile(null);
  }, [resetData]);
  
  // Process functions
  const processCertificate = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, certificate: null }));
    
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);
      setCertificateFile(file);
      setCertificateJson(parsedJson);
      resetData(); // Reset dependent data
      return true;
    } catch (error) {
      console.error('Error processing certificate:', error);
      setErrors((prev) => ({ ...prev, certificate: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [resetData]);
  
  const processData = useCallback(async (file) => {
    if (!certificateFile) {
      setErrors((prev) => ({ ...prev, data: 'Certificate must be uploaded first' }));
      return false;
    }
    
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, data: null }));
    
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);
      
      // Set data file and JSON
      setDataFile(file);
      setDataJson(parsedJson);
      
      // Generate data hash
      const hashedData = await browserPoseidonHasher(parsedJson);
      setDataHash(hashedData);
      
      // If alpha is already processed, generate metadata
      if (alphaJson) {
        const generatedMetaData = tagGenerator(alphaJson, parsedJson);
        setMetaData(generatedMetaData);
        
        // If all data is available, generate tag proof input
        if (alphaHash) {
          const tagProofInput = await Merger(dataJson, alphaJson, metaData, alphaHash, dataHash);
          setTagProofGenInput(tagProofInput);
          
          // Reset witness buffer since input changed
          setWitnessBuffer(null);
          // Reset proof since input changed
          setTagProofJson(null);
          setTagProofPublicJson(null);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error processing data file:', error);
      setErrors((prev) => ({ ...prev, data: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [certificateFile, alphaJson, alphaHash]);
  
  const processAlpha = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, alpha: null }));
    
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);
      
      // Set alpha file and JSON
      setAlphaFile(file);
      setAlphaJson(parsedJson);
      
      // Generate alpha hash
      const hashedData = await alphaHasher(parsedJson);
      setAlphaHash(hashedData);
      
      // If data is already processed, generate metadata  (sigma)
      if (dataJson) {
        const generatedMetaData = await tagGenerator(parsedJson, dataJson);
        setMetaData(generatedMetaData);
        
        // If all data is available, generate tag proof input
        if (dataHash) {
          const tagProofInput = await Merger(dataJson, parsedJson, generatedMetaData, hashedData, dataHash);
          console.log(tagProofInput);
          setTagProofGenInput(tagProofInput);
          
          // Reset witness buffer since input changed
          setWitnessBuffer(null);
          // Reset proof since input changed
          setTagProofJson(null);
          setTagProofPublicJson(null);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error processing alpha file:', error);
      setErrors((prev) => ({ ...prev, alpha: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [dataJson, dataHash]);
  
  const processTagProofGenWasm = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, tagProofGenWasm: null }));
    
    try {
      setTagProofGenWasmFile(file);
      
      // If tag proof gen input is already available, generate witness
      if (tagProofGenInput) {
        await processWitnessGeneration(file);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing TagProofGen WASM file:', error);
      setErrors((prev) => ({ ...prev, tagProofGenWasm: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tagProofGenInput]);
  
  const processWitnessGeneration = useCallback(async (wasmFile = null) => {
    const fileToUse = wasmFile || tagProofGenWasmFile;
    
    if (!fileToUse || !tagProofGenInput) {
      setErrors((prev) => ({ 
        ...prev, 
        witness: 'Both TagProofGen WASM file and input data are required'
      }));
      return false;
    }
    
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, witness: null }));
    
    try {
      // Read the WASM file as an ArrayBuffer
      const wasmBuffer = await fileToUse.arrayBuffer();
      
      // Generate witness using the provided function
      const wtnsBuffer = await generateWitness(wasmBuffer, tagProofGenInput);
      setWitnessBuffer(wtnsBuffer);
      
      // If zkey file is already uploaded, generate proof automatically
      if (zkeyFile) {
        await processProofGeneration();
      }
      
      return true;
    } catch (error) {
      console.error('Error generating witness:', error);
      setErrors((prev) => ({ ...prev, witness: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tagProofGenInput, tagProofGenWasmFile]);
  
  const processZkeyFile = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, zkey: null }));
    
    try {
      setZkeyFile(file);
      
      // If witness buffer is already available, generate proof
      if (witnessBuffer) {
        await processProofGeneration(file);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing zkey file:', error);
      setErrors((prev) => ({ ...prev, zkey: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [witnessBuffer]);
  
  const processProofGeneration = useCallback(async (zkeyFileToUse = null) => {
    const fileToUse = zkeyFileToUse || zkeyFile;
    
    if (!fileToUse || !witnessBuffer) {
      setErrors((prev) => ({ 
        ...prev, 
        proof: 'Both circuit_final.zkey file and witness buffer are required'
      }));
      return false;
    }
    
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, proof: null }));
    
    try {
      // Read the zkey file as an ArrayBuffer
      const zkeyBuffer = await fileToUse.arrayBuffer();
      
      // Generate proof using snarkjs
      // const { proof, publicSignals } = await snarkjs.groth16.prove(
      //   new Uint8Array(zkeyBuffer),
      //   witnessBuffer
      // );
      
      // // Format the proof and public signals
      // const formattedProof = {
      //   pi_a: proof.pi_a,
      //   pi_b: proof.pi_b,
      //   pi_c: proof.pi_c,
      //   protocol: "groth16"

      // };

      // setTagProofJson(formattedProof);
      // setTagProofPublicJson(publicSignals);


      // const result = generateProofUsingCliApi(zkeyBuffer, witnessBuffer);
      const result = await generateProof(zkeyBuffer, witnessBuffer);

      setTagProofJson(result.tagProofJson);
      setTagProofPublicJson(result.tagProofPublicJson);
      
      
      return true;
    } catch (error) {
      console.error('Error generating proof:', error);
      setErrors((prev) => ({ ...prev, proof: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [witnessBuffer, zkeyFile]);
  
  // Check if all required data is available for submission
  const isReadyForSubmission = certificateJson && dataJson && dataHash && 
    alphaJson && alphaHash && metaData && tagProofGenInput && witnessBuffer && 
    tagProofJson && tagProofPublicJson;
  
  const value = {
    // Files
    certificateFile,
    dataFile,
    alphaFile,
    tagProofGenWasmFile,
    zkeyFile,
    
    // Processed data
    certificateJson,
    dataJson,
    dataHash,
    alphaJson,
    alphaHash,
    metaData,
    tagProofGenInput,
    witnessBuffer,
    tagProofJson,
    tagProofPublicJson,
    
    // Status
    isProcessing,
    errors,
    isReadyForSubmission,
    
    // Functions
    processCertificate,
    processData,
    processAlpha,
    processTagProofGenWasm,
    processZkeyFile,
    processWitnessGeneration,
    processProofGeneration,
    resetData,
    resetAll
  };
  
  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};