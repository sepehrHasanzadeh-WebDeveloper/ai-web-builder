import { Noto_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import ThemeRegistry from "../theme/ThemeRegistry";
import "./globals.css";
import Navbar from "../components/Navbar/Navbar";

const persianFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-persian",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="fa" dir="rtl" className={cn(persianFont.variable)}>
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
