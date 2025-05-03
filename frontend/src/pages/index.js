import Head from "next/head";
import { useState } from "react";
import ChatInterface from "../components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Head>
        <title>AI Chatbot</title>
        <meta
          name="description"
          content="Personal AI Chatbot powered by Google Gemini"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">AI Chatbot</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by Google Gemini API
          </p>
        </div>
      </footer>
    </div>
  );
}
