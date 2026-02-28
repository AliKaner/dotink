import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INK Format v1.0",
  description: "A strict, fast, plain-text parser and playground for the INK syntax format.",
  keywords: ["INK format", "text parser", "markdown alternative", "nextjs parser"],
  authors: [{ name: "Ali Kaner" }],
  openGraph: {
    title: "INK Format v1.0 Playground",
    description: "Write, test, and render strict INK formatted text files.",
    url: "https://github.com/AliKaner/dotink",
    siteName: "INK Format",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
