import "@/styles/globals.css";
import '@ant-design/v5-patch-for-react-19';
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
