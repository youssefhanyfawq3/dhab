import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoldStonesBackgroundClient } from "@/components/3d/gold-stones-background-client";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DHAB - Egyptian Gold Price Tracker & AI Predictions",
  description: "Track real-time gold prices in Egypt with advanced AI-powered predictions. Get accurate forecasts for 24K, 22K, 21K, and 18K gold prices.",
  keywords: ["gold price", "Egypt", "24K", "22K", "21K", "18K", "gold prediction", "AI", "forecast"],
  authors: [{ name: "DHAB" }],
  openGraph: {
    title: "DHAB - Egyptian Gold Price Tracker",
    description: "Real-time gold prices with AI predictions",
    type: "website",
    locale: "en_EG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0A0A0F] text-white relative`}
      >
        {/* 3D Gold Stones Background with Error Boundary */}
        <ErrorBoundary 
          fallback={
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0A0A0F] via-[#141419] to-[#0A0A0F]">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]" />
              </div>
            </div>
          }
        >
          <GoldStonesBackgroundClient />
        </ErrorBoundary>

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
