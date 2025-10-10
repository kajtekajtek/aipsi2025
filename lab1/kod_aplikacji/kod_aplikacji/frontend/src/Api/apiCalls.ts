import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/';


axios.defaults.baseURL = BASE_URL;

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin' : '*', 'Allow-Credentials': 'true'},
  withCredentials: true
});