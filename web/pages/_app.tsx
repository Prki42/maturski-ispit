import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApiUrlContext, getApiUrl } from "../contexts/ApiUrl";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ApiUrlContext.Provider value={getApiUrl()}>
        <Component {...pageProps} />
      </ApiUrlContext.Provider>
    </>
  );
}

export default MyApp;
