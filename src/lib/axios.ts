import axios, { AxiosInstance } from "axios";

export let customClient: AxiosInstance = axios.create({
  timeout: 1000,
});
