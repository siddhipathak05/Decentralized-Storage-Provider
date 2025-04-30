import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import alphaHasher from '../utils/alphaHasher';
import { browserPoseidonHasher } from '../utils/BrowserDataFileHasher';
import tagGenerator from '../utils/tagGenerator';
import Merger from '../utils/merger';
import generateWitness from '../utils/generateWitness';
import generateResponse from '../utils/ResponseGen.js';

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
  const [respProofGenWasmFile, setRespProofGenWasmFile] = useState(null);
  const [respZkeyFile, setRespZkeyFile] = useState(null);
  
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

  // Response states
  const [responseJson, setResponseJson] = useState(null);
  const [respProofGenInput, setRespProofGenInput] = useState(null);
  const [respWitnessBuffer, setRespWitnessBuffer] = useState(null);
  const [respProofJson, setRespProofJson] = useState(null);
  const [respProofPublicJson, setRespProofPublicJson] = useState(null);

  // Processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Reset functions
  //const resetData = useCallback(() => {
  //  setDataFile(null);
  //  setDataJson(null);
  //  setDataHash(null);
  //  setMetaData(null);
  //  setTagProofGenInput(null);
  //  setWitnessBuffer(null);
  //  setTagProofJson(null);
  //  setTagProofPublicJson(null);
  //}, []);
  //
  //const resetAll = useCallback(() => {
  //  setCertificateFile(null);
  //  setCertificateJson(null);
  //  resetData();
  //  setAlphaFile(null);
  //  setAlphaJson(null);
  //  setAlphaHash(null);
  //  setTagProofGenWasmFile(null);
  //  setZkeyFile(null);
  //}, [resetData]);

  // Add resetChallenge function to ProviderContextProvider
  const resetChallenge = useCallback(() => {
    setResponseJson(null);
    setRespProofGenInput(null);
    setRespProofGenWasmFile(null);
    setRespWitnessBuffer(null);
    setRespZkeyFile(null);
    setRespProofJson(null);
    setRespProofPublicJson(null);
    setErrors((prev) => ({
      ...prev,
      challenge: null,
      respProofGenWasm: null,
      respWitness: null,
      respZkey: null,
      respProof: null
    }));
  }, []);

  useEffect(() => {
  console.log("MetaData updated:", metaData);
}, [metaData]);
  
  // Process functions
  const processCertificate = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, certificate: null }));
    
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);
      setCertificateFile(file);
      setCertificateJson(parsedJson);
      //resetData(); // Reset dependent data
      return true;
    } catch (error) {
      console.error('Error processing certificate:', error);
      setErrors((prev) => ({ ...prev, certificate: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
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
        const generatedMetaData = await tagGenerator(alphaJson, parsedJson);
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


      // const result = generateProofUsingCliApi(zkeyBuffer, witnessBuffer);
      const result = await generateProof(zkeyBuffer, witnessBuffer);

      setTagProofJson(result.ProofJson);
      setTagProofPublicJson(result.ProofPublicJson);
      
      
      return true;
    } catch (error) {
      console.error('Error generating proof:', error);
      setErrors((prev) => ({ ...prev, proof: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [witnessBuffer, zkeyFile]);

  const processChallenge = useCallback((md, seed) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, challenge: null }));
    
    try {
      // Import and call generateResponse function
       console.log();
      const response = generateResponse(dataJson, md,seed);
      
      // Store the response
      setResponseJson(response);
      
      // If alpha data is already available, generate response proof input
      if (alphaJson && alphaHash) {
        const respProofInput = Merger(response, alphaJson, alphaHash);
        setRespProofGenInput(respProofInput);
      }
      
      return response;
    } catch (error) {
      console.error('Error processing challenge:', error);
      setErrors((prev) => ({ ...prev, challenge: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [alphaJson, alphaHash]);

  const processRespProofGenWasm = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, respProofGenWasm: null }));
    
    try {
      setRespProofGenWasmFile(file);
      
      // If response proof gen input is already available, generate witness
      if (respProofGenInput) {
        await processRespWitnessGeneration(file);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing RespProofGen WASM file:', error);
      setErrors((prev) => ({ ...prev, respProofGenWasm: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [respProofGenInput]);

  const processRespWitnessGeneration = useCallback(async (wasmFile = null) => {
    const fileToUse = wasmFile || respProofGenWasmFile;
    
    if (!fileToUse || !respProofGenInput) {
      setErrors((prev) => ({ 
        ...prev, 
        respWitness: 'Both RespProofGen WASM file and response input data are required'
      }));
      return false;
    }
    
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, respWitness: null }));
    
    try {
      // Read the WASM file as an ArrayBuffer
      const wasmBuffer = await fileToUse.arrayBuffer();
      
      // Generate witness using the provided function
      const wtnsBuffer = await generateWitness(wasmBuffer, respProofGenInput);
      setRespWitnessBuffer(wtnsBuffer);
      
      return true;
    } catch (error) {
      console.error('Error generating response witness:', error);
      setErrors((prev) => ({ ...prev, respWitness: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [respProofGenInput, respProofGenWasmFile]);

  const processRespZkeyFile = useCallback(async (file) => {
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, respZkey: null }));
    
    try {
      setRespZkeyFile(file);
      
      // If response witness buffer is already available, generate proof
      if (respWitnessBuffer) {
        await processRespProofGeneration(file);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing resp zkey file:', error);
      setErrors((prev) => ({ ...prev, respZkey: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [respWitnessBuffer]);

  const processRespProofGeneration = useCallback(async (zkeyFileToUse = null) => {
    const fileToUse = zkeyFileToUse || respZkeyFile;
    
    if (!fileToUse || !respWitnessBuffer) {
      setErrors((prev) => ({ 
        ...prev, 
        respProof: 'Both Circuit2.zkey file and response witness buffer are required'
      }));
      return false;
    }
    
    setIsProcessing(true);
    setErrors((prev) => ({ ...prev, respProof: null }));
    
    try {
      // Read the zkey file as an ArrayBuffer
      const zkeyBuffer = await fileToUse.arrayBuffer();
      
      
      const result = await generateProof(zkeyBuffer, respWitnessBuffer);
      
      setRespProofJson(result.ProofJson);
      setRespProofPublicJson(result.ProofPublicJson);
      
      return true;
    } catch (error) {
      console.error('Error generating response proof:', error);
      setErrors((prev) => ({ ...prev, respProof: error.message }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [respWitnessBuffer, respZkeyFile]);
  
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
    respProofGenWasmFile,
    respZkeyFile,
    
    // Processed stuff
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
    responseJson,
    respProofGenInput,
    respWitnessBuffer,
    respProofJson,
    respProofPublicJson,
      
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
    processChallenge,
    processRespProofGenWasm,
    processRespWitnessGeneration,
    processRespZkeyFile,
    processRespProofGeneration,
    //resetData,
    //resetAll,
    resetChallenge
  };
  
  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};
