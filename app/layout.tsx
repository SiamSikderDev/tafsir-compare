import type { Metadata } from "next";
import { Amiri, Hind_Siliguri } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "তাফসীর তুলনা — Tafsir Compare",
    template: "%s | তাফসীর তুলনা",
  },
  description:
    "সুন্নি ও শিয়া দৃষ্টিকোণ থেকে কুরআনের তাফসীর — গবেষণাভিত্তিক, সূত্র-সমর্থিত, নিরপেক্ষ তুলনা। Research-based Quran tafsir comparing Sunni and Shia perspectives with full source citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className="h-full">
      <body
        className={`${amiri.variable} ${hindSiliguri.variable} min-h-full bg-white font-bengali text-neutral-900 antialiased dark:bg-black dark:text-neutral-100`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
