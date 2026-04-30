import type { Metadata } from "next";
import "./globals.css";

import NavBar from "@/components/navbar";
import DevServiceWorkerCleanup from "@/components/dev-sw-cleanup";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Hire Heaven",
  description:
    "Job Portal Application for connecting employers and job seekers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DevServiceWorkerCleanup />
        <AppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
