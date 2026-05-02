import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import {NavMenu} from "@/components/NavMenu";
import {AuthProvider} from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner"

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "anisphere — Track Your Anime",
  description: "AniSphere is a modern anime tracking platform. Organize your watchlist, discover new series, and share your anime journey with the community.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${beVietnamPro.variable} antialiased`}
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
      <AuthProvider>
        <NavMenu/>
        <main className="container flex min-h-screen max-w-5xl flex-col items-center justify-between py-12 px-4 md:px-8 lg:px-16">
        {children}
        </main>
          <Toaster />
      </AuthProvider>
      </body>

    </html>
  );
}
