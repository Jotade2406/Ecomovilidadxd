import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { NotificacionProvider } from "@/context/NotificacionContext";
/* FIX 2: ThemeProvider envuelve toda la app para dark/light mode */
import { ThemeProvider } from "@/context/ThemeContext";
import ToastContainer from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoMovilidad AI — Enrutamiento Inteligente",
  description:
    "Plataforma GIS de enrutamiento ecológico inteligente. Crea, gestiona y visualiza rutas sostenibles en tiempo real sobre Santa Cruz, Bolivia.",
  keywords: ["rutas", "ecología", "movilidad", "GIS", "OSRM", "Santa Cruz"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        {/* FIX 2: ThemeProvider wraps everything for dark/light mode */}
        <ThemeProvider>
          <AuthProvider>
            <NotificacionProvider>
              {children}
              <ToastContainer />
            </NotificacionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
