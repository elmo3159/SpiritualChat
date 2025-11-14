import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import BottomNavigation from "@/app/components/navigation/BottomNavigation";
import GoogleAnalytics from "@/lib/analytics/google-analytics";
import RegisterServiceWorker from "@/lib/pwa/register-sw";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "スピチャ - AI占いアプリ",
  description: "人気占い師監修のAI占いで、あなたの悩みを解決します",
  manifest: "/manifest.json",
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
    title: "スピチャ - AI占いアプリ",
    description: "人気占い師監修のAI占いで、あなたの悩みを解決します",
  },
  twitter: {
    card: "summary_large_image",
    title: "スピチャ - AI占いアプリ",
    description: "人気占い師監修のAI占いで、あなたの悩みを解決します",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#d4af37",
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
        <RegisterServiceWorker />
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
