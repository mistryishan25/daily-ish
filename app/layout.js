import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // Import the Script component
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
  title: "My Garden",
  description: "Nounish Habit Tracker",
  icons : {
    apple: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAgMTgwIj4KICA8cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI0ZGRDcwMCIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjgiLz4KICA8cmVjdCB4PSI1NSIgeT0iNjAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjU1IiB5PSI4MCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iNTUiIHk9IjEwMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg==",
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
        {/* Load the confetti library from a CDN */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}