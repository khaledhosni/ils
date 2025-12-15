import axios from 'axios';

let ApiClient = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/",
  timeout: 10000,
});

ApiClient.interceptors.request.use((req) => {
     let token =localStorage.getItem("token");
  req.headers.Authorization= "Bearer "+ token;
  console.log("interceptor:");

  return req
});

export default ApiClient;