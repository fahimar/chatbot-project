import { Inter, JetBrains_Mono } from "next/font/google";
import "../pages/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
