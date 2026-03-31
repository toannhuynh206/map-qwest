import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Map Qwest",
  description: "Learn geography through fun quizzes — pin countries, guess flags, master the map!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-emerald-50 text-gray-800">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
