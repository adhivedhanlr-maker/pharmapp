import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PharmaApp | B2B Healthcare Marketplace",
  description: "Connecting Distributors, Retailers and Salesmen in a seamless pharma marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakarta.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
