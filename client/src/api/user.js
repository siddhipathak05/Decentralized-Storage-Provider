import axiosInstance from './axiosInstance';

export const uploadUserData = async (hashedJson) => {
  return axiosInstance.post('/user/upload-data', {
    userData: hashedJson,
  });
};
