import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import BottomNavigation from "@/app/components/navigation/BottomNavigation";
import GoogleAnalytics from "@/lib/analytics/google-analytics";
import TikTokPixel from "@/lib/analytics/tiktok-pixel";
import RegisterServiceWorker from "@/lib/pwa/register-sw";
import InstallPrompt from "@/app/components/pwa/InstallPrompt";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: {
    default: "人気占い師監修のAIチャット占い【スピチャ】",
    template: "%s | スピチャ"
  },
  description: "24時間365日いつでも相談できる本格AI占い。恋愛・復縁・仕事の悩みを人気占い師監修のAIが解決。初回1000pt無料",
  manifest: "/manifest.json?v=2",
  verification: {
    google: "5e9ctUo8hxatMmni9GvRg0rf4eDd83j_lnEOxDsigR0",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/icons/icon-152x152.png?v=2", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "スピチャ",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "スピチャ",
    title: "人気占い師監修のAIチャット占い【スピチャ】",
    description: "24時間365日いつでも相談できる本格AI占い。恋愛・復縁・仕事の悩みを人気占い師監修のAIが解決。初回1000pt無料",
  },
  twitter: {
    card: "summary_large_image",
    title: "人気占い師監修のAIチャット占い【スピチャ】",
    description: "24時間365日いつでも相談できる本格AI占い。恋愛・復縁・仕事の悩みを人気占い師監修のAIが解決。初回1000pt無料",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#e88ca5",
  viewportFit: "cover", // PWA用: iOSの安全領域を適切に処理
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ja">
      <body className={inter.className}>
        <NextTopLoader
          color="#d4af37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={4}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d4af37,0 0 5px #d4af37"
        />
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        <TikTokPixel />
        <RegisterServiceWorker />
        <InstallPrompt />
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <BottomNavigation />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
