import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "PyShield — AI Powered Secure Code Analysis",
  description: "Detect security vulnerabilities in your Python code with AST analysis and AI-powered remediation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable}`} style={{ fontFamily: "var(--font-inter)" }}>
        <div className="grid-bg" />
        <div className="scanline scanline-green" />
        <div className="scanline scanline-amber" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        {children}
      </body>
    </html>
  );
}