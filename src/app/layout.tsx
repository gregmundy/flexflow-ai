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
  title: "FlexFlow - Your AI Personal Trainer Texts You Workouts Every Morning",
  description: "Get personalized workouts delivered via SMS from AI trainers with unique personalities. No app needed. Just text messages that fit your busy lifestyle. $25/month.",
  keywords: ["AI personal trainer", "SMS workouts", "personalized fitness", "text message training", "no app fitness"],
  openGraph: {
    title: "FlexFlow - Your AI Personal Trainer",
    description: "Personalized workouts delivered via SMS. No app needed.",
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
