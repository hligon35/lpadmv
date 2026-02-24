import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "../components/SiteShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Life Prep Academy DMV",
  description: "Leadership and athletic development through training.",
  icons: {
    icon: "/lpadmvLogo.PNG",
    apple: "/lpadmvLogo.PNG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable}`}>
      <body className="min-h-dvh bg-lpa-bg text-lpa-fg">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
