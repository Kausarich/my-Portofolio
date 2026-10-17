import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/PlusJakartaSans.woff2",
  variable: "--font-sans-main",
  display: "swap",
  weight: "200 800",
});

const geistMono = localFont({
  src: "./fonts/JetBrainsMono.woff2",
  variable: "--font-mono-main",
  display: "swap",
  weight: "100 800",
});

export const metadata: Metadata = {
  title: {
    default: "Gian Kausari — Developer & Creative Thinker",
    template: "%s — Gian Kausari",
  },
  description:
    "Thoughtful code. Meaningful experiences. A personal portfolio at the intersection of design and development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Providers>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
