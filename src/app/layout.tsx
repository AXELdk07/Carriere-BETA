import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CARRIÈRE BETA",
  description:
    "Testez vos connaissances en football ! Identifiez les joueurs grâce à leurs carrières.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-96x96.png", sizes: "96x96" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "CARRIÈRE BETA",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className={`min-h-screen football-bg ${plusJakarta.className}`}>
        {/* ✅ Contenu principal */}
        {children}

        {/* ✅ Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-copy">
              © 2026 <span className="footer-brand">CARRIÈRE.BETA</span>
            </p>
            <p className="footer-tagline">
              Testez vos connaissances footballistiques — Jouez, progressez, dominez.
            </p>
            <div className="footer-divider" />
            <p className="footer-contact">
              📧 Contacter nous sur :{' '}
              <a href="mailto:carriere.beta@gmail.com" className="footer-link">
                carriere.beta@gmail.com
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}