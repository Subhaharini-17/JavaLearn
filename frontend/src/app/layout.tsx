// Enhanced RootLayout.tsx - Dark Theme
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter, Source_Code_Pro } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

// Add '/auth' to public routes
const publicRoutes = ["/login", "/register", "/", "/auth"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      console.log("🔐 Auth check:", { 
        token: !!token, 
        user: !!user, 
        pathname 
      });
      
      if (token && user) {
        try {
          const userObj = JSON.parse(user);
          console.log("👤 Parsed user:", userObj);
          setIsAuthenticated(true);
          setUserRole(userObj.role);
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        console.log("❌ No auth token or user data");
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      console.log("💾 Storage changed, rechecking auth...");
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check auth on focus in case of tab changes
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, [pathname]);

  // Redirect based on auth
  useEffect(() => {
    console.log("🔄 Redirect check:", { 
      isAuthenticated, 
      userRole, 
      pathname,
      isPublicRoute: publicRoutes.includes(pathname)
    });

    if (isAuthenticated === null) {
      console.log("⏳ Auth status: Still loading...");
      return;
    }

    // If NOT authenticated AND trying to access protected route → redirect to login
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      console.log("🚫 Not authenticated, redirecting to login");
      router.replace("/login");
      return;
    }

    // If authenticated AND on a public route → redirect to appropriate dashboard
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      console.log("✅ Authenticated on public route, redirecting to dashboard");
      const targetRoute = userRole === "admin" ? "/admin/dashboard" : "/student/dashboard";
      console.log("🎯 Redirecting to:", targetRoute);
      router.replace(targetRoute);
      return;
    }

    console.log("✅ Allowed to view current page");
  }, [isAuthenticated, pathname, router, userRole]);

  // Loading screen while checking auth
  if (isAuthenticated === null && !publicRoutes.includes(pathname)) {
    console.log("⏳ Showing loading screen...");
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          "flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900/30 font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}>
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-blue-500/30"></div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">JavaLearn</p>
              <p className="text-sm text-gray-400">Checking authentication...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  console.log("🎯 Rendering main layout - Auth:", isAuthenticated, "Role:", userRole);
  
  return (
    <html 
      lang="en" 
      className={cn(
        fontSans.variable,
        fontMono.variable
      )} 
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <title>JavaLearn - Java Tutorial Platform</title>
        <meta
          name="description"
          content="An interactive Java learning platform with compiler and tutorials"
        />
      </head>
      <body className={cn(
        "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900/30 font-sans antialiased",
        "flex flex-col"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}