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

export const uploadCertificate = async (certificateJson) => {
  return axiosInstance.post('/provider/upload-certificate', {
    certificate: certificateJson
  });
};