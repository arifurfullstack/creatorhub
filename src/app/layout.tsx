import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/db";
import Navbar from "@/components/shared/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "website_title",
            "website_meta_title",
            "website_meta_description",
            "website_keywords",
            "website_favicon",
          ],
        },
      },
    });

    const metaTitle = settings.find((s) => s.key === "website_meta_title")?.value || 
                      settings.find((s) => s.key === "website_title")?.value || 
                      "CreatorHub | Premium Creator Economy Platform";
    
    const metaDescription = settings.find((s) => s.key === "website_meta_description")?.value || 
                            "Monetize your content through subscriptions, locked posts, tips, and direct messaging. The ultimate SaaS platform for creators and fans.";
    
    const keywords = settings.find((s) => s.key === "website_keywords")?.value || 
                     "creator, platform, subscriptions, economy";
    
    const favicon = settings.find((s) => s.key === "website_favicon")?.value || "/favicon.ico";

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: keywords,
      icons: {
        icon: favicon,
      },
    };
  } catch (error) {
    console.error("Failed to generate dynamic metadata:", error);
    return {
      title: "CreatorHub | Premium Creator Economy Platform",
      description: "Monetize your content through subscriptions, locked posts, tips, and direct messaging. The ultimate SaaS platform for creators and fans.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let logoText = "CREATORHUB";
  let defaultTheme = "dark";

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["website_logo", "website_theme"],
        },
      },
    });

    logoText = settings.find((s) => s.key === "website_logo")?.value || "CREATORHUB";
    defaultTheme = settings.find((s) => s.key === "website_theme")?.value || "dark";
  } catch (error) {
    console.error("Failed to fetch layout configurations:", error);
  }

  const themeClass = defaultTheme.startsWith("theme-") ? defaultTheme : "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        {/* Apple Liquid Mesh Background Blobs */}
        <div className="liquid-mesh-container">
          <div className="liquid-mesh-blob liquid-mesh-blob-1" />
          <div className="liquid-mesh-blob liquid-mesh-blob-2" />
          <div className="liquid-mesh-blob liquid-mesh-blob-3" />
        </div>

        <Navbar logoText={logoText} defaultTheme={defaultTheme} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster theme="dark" closeButton richColors position="top-right" />
      </body>
    </html>
  );
}
