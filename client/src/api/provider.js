import axiosInstance from './axiosInstance'; 

export const uploadProviderData = async (dataHash, alphaHash, metaData, tagProofJson, tagProofPublicJson) => {
  return axiosInstance.post('/provider/upload-data', {
    dataHash,
    alphaHash,
    metaData,
    tagProofJson,
    tagProofPublicJson
  });
};

// Add this function in api/provider.js
export const uploadProviderChallenge = async (metaData, respProofJson, respProofPublicJson) => {
  return axiosInstance.post('/provider/upload-challenge', {
    metaData,
    respProofJson,
    respProofPublicJson
  });
};

export const uploadCertificate = async (certificateJson) => {
  return axiosInstance.post('/provider/upload-certificate', {
    certificate: certificateJson
  });
};

export const get_seed = async () => {
  return axiosInstance.get('/provider/get_seed');
};
