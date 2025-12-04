import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Providers from "./providers";
import ErrorBoundary from "../components/ErrorBoundary"; // Import ErrorBoundary

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TF-ICRE™ | Risk Intelligence Platform",
  description: "The Next-Generation Risk Intelligence Platform for African Development Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <ErrorBoundary> {/* Wrap AuthProvider with ErrorBoundary */}
            <AuthProvider>
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}