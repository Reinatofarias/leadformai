import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "LeadFlow AI — Funis Interativos para Qualificação de Leads",
  description: "Crie funis interativos que qualificam leads automaticamente e enviam os contatos certos para o WhatsApp, CRM ou automação.",
  keywords: ["funis interativos", "qualificação de leads", "quiz", "landing page", "WhatsApp", "captura de leads"],
  openGraph: {
    title: "LeadFlow AI",
    description: "Crie funis interativos que qualificam leads automaticamente.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

