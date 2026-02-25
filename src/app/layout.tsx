import { APP_DESCRIPTION, APP_TITLE, APP_URL } from "@/lib/constants";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_TITLE,
    template: `%s — ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_TITLE,
  authors: [{ name: "frontier-intelligence" }],
  keywords: [
    "LLM",
    "AI models",
    "Pareto frontier",
    "price performance",
    "Arena ELO",
    "OpenRouter",
    "GPT",
    "Claude",
    "Gemini",
    "benchmark",
    "comparison",
  ],
  openGraph: {
    type: "website",
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: APP_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
