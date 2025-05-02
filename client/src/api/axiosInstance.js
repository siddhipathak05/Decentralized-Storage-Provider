import axios from "axios";

const instance = axios.create({
  //baseURL: "http://192.168.12.218:8000/api",
  baseURL:"/api",
  withCredentials: true,
});


export default instance;
