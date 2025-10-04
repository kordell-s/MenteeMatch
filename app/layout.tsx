import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProvider";
import { Providers } from "./providers";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MenteeMatch",
  description: "Connect with mentors and grow your career",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          <Providers>
            <ConditionalNavbar />
            <main>{children}</main>
          </Providers>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
