import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bharat-Insight | AI-Driven Data Platform",
  description:
    "India's most advanced multi-tenant analytics platform. Analyze 100,000+ data points with real-time AI insights, powered by Gemini.",
  keywords: [
    "India analytics",
    "TRAI data",
    "government data",
    "AI insights",
    "data platform",
  ],
  openGraph: {
    title: "Bharat-Insight – AI-Driven Data Platform",
    description: "Real-time analytics on Indian public data with Gemini AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
