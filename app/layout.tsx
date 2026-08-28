import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/cart/CartProvider";
import { siteUrlObject } from "@/lib/site";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });


export const metadata: Metadata = {
  metadataBase: siteUrlObject,
  title: {
    default: "UrbanCraft — Furniture Made to Order in Kampala",
    template: "%s · UrbanCraft",
  },
  description:
    "Sofas, beds, wall units, dining sets and office furniture handmade in Kampala. Choose your timber and finish, pay by mobile money, delivered across Uganda.",
  openGraph: { type: "website", siteName: "UrbanCraft Furniture Workshop", locale: "en_UG" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#17150f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-UG" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">
        {/* The cart lives in localStorage, so the provider spans admin too
            without cost — it keeps a single mount point for the whole app. */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
