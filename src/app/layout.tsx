import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Jtnova | Agence Web & Digital",
  description:
    "Jtnova — Agence web spécialisée en création de sites, design UI/UX et applications web sur mesure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,800,500,400,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
