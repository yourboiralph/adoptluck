import type { Metadata } from "next";
import { Geist, Geist_Mono, Luckiest_Guy, Fredoka  } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
});

const luckiest = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-luckiest",
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🍀Adopt Luck",
  description: "Win big prizes!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${luckiest.variable} antialiased dark font-luckiest ${fredoka.variable}`}
      >
          {children}
          <Toaster />
      </body>
    </html>
  );
}
