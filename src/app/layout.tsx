import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingContextProvider } from "@/contexts/LoadingContext";
import { LoadingProvider } from "@/components/LoadingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sahay - Connect, Learn, Grow",
  description:
    "A platform connecting students and professionals for mentorship, peer learning, and career growth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <LoadingContextProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </LoadingContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
