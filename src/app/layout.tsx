import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import HideOnAdmin from "@/components/HideOnAdmin";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mi Dulce Antojo | Postres Artesanales",
    template: "%s | Mi Dulce Antojo",
  },
  description:
    "Postres artesanales elaborados con amor. Tortas, queques, pyes de limón, cheesecakes, crema volteada, bocaditos y más. Pedidos por WhatsApp.",
  keywords: [
    "postres artesanales",
    "tortas",
    "queques",
    "pye de limón",
    "cheesecake",
    "crema volteada",
    "bocaditos",
    "pastelería",
  ],
  openGraph: {
    title: "Mi Dulce Antojo | Postres Artesanales",
    description: "Postres artesanales elaborados con amor para endulzar tus momentos especiales.",
    type: "website",
    locale: "es_PE",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#2d1b1b] font-sans antialiased">
        <HideOnAdmin>
          <Header />
        </HideOnAdmin>
        <main className="flex-1">{children}</main>
        <HideOnAdmin>
          <Footer />
          <WhatsAppFloat />
        </HideOnAdmin>
      </body>
    </html>
  );
}
