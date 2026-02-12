import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoldStonesBackgroundClient } from "@/components/3d/gold-stones-background-client";

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
        {/* 3D Gold Stones Background */}
        <GoldStonesBackgroundClient />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
