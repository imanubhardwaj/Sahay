import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingContextProvider } from "@/contexts/LoadingContext";
import { LoadingProvider } from "@/components/LoadingProvider";
import FCMTokenInitializer from "@/config/FCMTokenInitializer";
import NotificationPermissionBanner from "@/components/notifications/NotificationPermissionBanner";
import { AlertWrapperClient } from "@/components/AlertWrapperClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sahay - Connect, Learn, Grow",
  description:
    "A platform connecting many students and professionals for mentorship, peer learning, and career growth",
  manifest: "/manifest.json",
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
            <LoadingProvider>
              <FCMTokenInitializer />
              <NotificationPermissionBanner />
              <AlertWrapperClient />
              {children}
            </LoadingProvider>
          </LoadingContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
