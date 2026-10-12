import type { Metadata } from "next";
import { Archivo, Permanent_Marker } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProvider";
import { Providers } from "./providers";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const marker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MentorMatch: a mentor sets your route",
    template: "%s · MentorMatch",
  },
  description:
    "MentorMatch pairs students and new grads with mentors in their field (tech, business, aviation and more) who share their skills. Then the mentor sets a step-by-step roadmap to a first role.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${marker.variable}`}>
      <body className="antialiased">
        <SessionProviderWrapper>
          <Providers>
            <ConditionalNavbar />
            {children}
          </Providers>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
