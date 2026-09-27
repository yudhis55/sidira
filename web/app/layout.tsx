import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const SITE_NAME = "SIDIRA — Sistem Digital Inventaris Ruangan";
const SITE_DESC =
  "Aplikasi manajemen inventaris aset UPTD Puskesmas Baruharjo, Trenggalek: ruangan, SBBK, pakta integritas, usulan, ceklist, dan laporan.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: SITE_NAME,
    template: "%s · SIDIRA",
  },
  description: SITE_DESC,
  keywords: [
    "SIDIRA",
    "inventaris",
    "puskesmas",
    "Baruharjo",
    "Trenggalek",
    "aset",
    "SBBK",
    "pakta integritas",
  ],
  authors: [{ name: "UPTD Puskesmas Baruharjo" }],
  creator: "UPTD Puskesmas Baruharjo",
  icons: {
    icon: "/logo-puskesmas.png",
    apple: "/logo-puskesmas.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SIDIRA",
    title: SITE_NAME,
    description: SITE_DESC,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIDIRA — Sistem Digital Inventaris Ruangan Aset, UPTD Puskesmas Baruharjo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#062820",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased",
        sora.variable,
        jetbrainsMono.variable,
        inter.variable
      )}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
