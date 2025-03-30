import axios, { InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

const axiosClient = axios.create({
  baseURL: "https://api.omnistrate.cloud",
});

let _token = null;

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (_token && (jwtDecode(_token) as any).exp * 1000 < Date.now()) {
        config.headers.Authorization = `Bearer ${_token}`;
        return config;
      }
    } catch (_) {
      //
    }
    try {
      console.log("Signing in to Omnistrate: " + process.env.OMNISTRATE_USER);
      const response = await axios.post(
        "https://api.omnistrate.cloud/2022-09-01-00/signin",
        {
          email: process.env.OMNISTRATE_USER,
          password: process.env.OMNISTRATE_PASSWORD,
        }
      );
      config.headers.Authorization = `Bearer ${response.data.jwtToken}`;
      return config;
    } catch (e) {
      console.error((e as any).response.data);
      return config;
    }
  }
);

export { axiosClient };
