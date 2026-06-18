import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/pharma/Header";
import Footer from "@/components/pharma/Footer";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://phytoinsight.com"),

  title: "PhytoInsight — Scientific Evidence-Based Intelligence Platform",

  description:
    "Evidence-based scientific intelligence platform for pharmacological analysis, drug-herb interaction evaluation, and phytochemical profiling. Developed by Dr. Mahmoud Mostafa. Powered by PubMed, CrossRef, OpenAlex, and OpenFDA.",

  verification: {
    google: "pf5paDsLObwRC6H6NaprQkdHLrHdQpOHhndnW9obEyQ",
  },

  keywords: [
    "PhytoInsight",
    "drug-herb interaction",
    "pharmacology",
    "phytochemistry",
    "evidence-based",
    "medicinal plants",
    "herbal medicine",
    "natural products",
    "pharmacognosy",
    "plant compounds",
    "scientific database",
    "PubMed",
    "CrossRef",
    "OpenAlex",
    "OpenFDA",
    "scientific literature",
  ],

  authors: [{ name: "Dr. Mahmoud Mostafa" }],

  icons: {
    icon: "/logo.svg",
  },

  openGraph: {
    title: "PhytoInsight",
    description:
      "Scientific platform for phytochemistry, pharmacology, medicinal plants and herb-drug interactions.",
    url: "https://phytoinsight.com",
    siteName: "PhytoInsight",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
      <AuthProvider>
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <Toaster />
      </AuthProvider>
      </body>
    </html>
  );
}
