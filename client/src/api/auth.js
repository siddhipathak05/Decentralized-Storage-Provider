import axios from "./axiosInstance";

export const loginUser = (username, password) => {
  return axios.post("/auth/login", { username, password }, { withCredentials: true });
};

export const registerUser = (username, password, role) => {
  return axios.post("/auth/register", { username, password, role }, { withCredentials: true });
};
