import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pattern HQ",
  description: "Nounish Habit Tracker & Research Lab",
  // Enabling PWA features for iPhone
  appleWebApp: {
    capable: true,
    title: "Pattern HQ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    // High-contrast Lab Flask Icon (Yellow background, White Beaker)
    apple: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAgMTgwIj4KICA8cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI0ZGRDcwMCIvPgogIDxwYXRoIGQ9Ik02MCA0MCBoNjAgTTkwIDQwIHY2MCBMNTAgMTQwIGg4MCBMOTAgMTAwIFoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHJlY3QgeD0iNzUiIHk9IjExNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjYiIGZpbGw9ImJsYWNrIiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        {/* Load the confetti library globally */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}