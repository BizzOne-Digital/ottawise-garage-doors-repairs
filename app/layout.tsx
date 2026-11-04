import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const icon = s.faviconUrl || "/brand/favicon.svg";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.businessName, template: `%s` },
    applicationName: s.businessName,
    icons: { icon: [{ url: icon }], apple: [{ url: icon }] },
    openGraph: { siteName: s.businessName, locale: "en_CA", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={manrope.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
