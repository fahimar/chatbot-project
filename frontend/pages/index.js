import Head from "next/head";
import ChatInterface from "../src/components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#E0FAFF]">
      <Head>
        <title>FACES Assistant</title>
        <meta
          name="description"
          content="FACES Assistant — your medical-aesthetics concierge. Ask about treatments, pricing, and aftercare guidance."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#06B6D4] flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.35)]">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
                  fill="#fff"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0F172A] leading-tight">
                FACES Assistant
              </h1>
              <p className="text-xs text-[#64748B] leading-tight">
                Medical-aesthetics concierge
              </p>
            </div>
          </div>
          <span className="text-xs bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-[6px] h-[6px] rounded-full bg-[#10B981]" />
            Online
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          {/* Intro */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-semibold text-[#0F172A]">
              Here to help with your treatments
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Anti-wrinkle · Dermal fillers · Skincare · Aftercare · Pricing &amp; more
            </p>
          </div>

          {/* Chat UI */}
          <ChatInterface />

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#94A3B8] mt-4">
            General guidance only — your practitioner will confirm medical advice.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-3">
        <p className="text-center text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} FACES · Medical-aesthetics clinic &amp; training academy
        </p>
      </footer>
    </div>
  );
}

