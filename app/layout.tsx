// app/layout.tsx
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
  title: "Movie Night",
  description: "Event planning app for movie nights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning
      className="scrollbar-hidden"
    >
      <body suppressHydrationWarning
        className={`max-w-screen overflow-x-hidden ${geistSans.variable} ${geistMono.variable} antialiased w-screen min-h-screen scrollbar-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
