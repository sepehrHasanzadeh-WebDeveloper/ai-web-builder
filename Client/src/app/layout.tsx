import { Geist, Vazirmatn } from "next/font/google";

import { cn } from "@/lib/utils";
import ThemeRegistry from "../theme/ThemeRegistry"; 
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
  weight: ["300", "400", "500", "600", "700"],
});
export const metadata = {
  title: "AI Website Builder",
  description: "Build modern websites with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={cn("font-sans", geist.variable)}>
      <body className={vazirmatn.variable}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
