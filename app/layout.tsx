import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Hologram Ads — Your logo, floating in mid-air",
  description:
    "Holographic LED fan displays with custom 3D content for liquor stores, donut shops, juice bars and phone shops. Fan + cover $250, content $150, tripod $99.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
