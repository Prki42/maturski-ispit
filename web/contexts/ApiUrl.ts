import { createContext } from "react";

export const apiUrls = {
  production: process.env.MATURSKI_API_URL || "url",
  dev: "http://localhost:3030",
};

export const ApiUrlContext = createContext(apiUrls.dev);

export const getApiUrl = () => {
  if (process.env.PRODUCTION === "true") {
    return apiUrls.production;
  }
  return apiUrls.dev;
};
