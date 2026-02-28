import Head from "next/head";
import ChatInterface from "../src/components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Head>
        <title>FACES Health AI Assistant</title>
        <meta
          name="description"
          content="FACES Health RAG Chatbot — Ask about aesthetic treatments, Botox, fillers, skincare & training courses."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow">
              F
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                FACES Health
              </h1>
              <p className="text-xs text-rose-500 leading-tight font-medium">
                AI Health Assistant
              </p>
            </div>
          </div>
          <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-medium">
            ● Online
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          {/* Intro */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Ask about our treatments
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Botox · Fillers · Skincare · Training Courses · Pricing & more
            </p>
          </div>

          {/* Chat UI */}
          <ChatInterface />

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            This AI assistant provides general information only. For medical
            advice, consult a qualified professional.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-3">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} FACES Health · Powered by RAG AI ·
          <span className="text-rose-400"> api.faces.health</span>
        </p>
      </footer>
    </div>
  );
}

