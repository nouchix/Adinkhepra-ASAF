import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KTOS — Proof Over Promises for AI Agents That Touch Production | NouchiX',
  description: 'The execution gate and proof layer for AI agents that touch production. Signed, independently verifiable evidence for every agent action — with CMMC-grade evidence for defense contractors.',
  keywords: 'KTOS, Khepra Trust OS, AI agent execution gate, PQC-MCP, MCP security, post-quantum, ML-DSA-65, FIPS 204, agentic SOC, NIST 800-171, sovereign bare-metal, SecRed, NouchiX, AdinKhepra ASAF, SouHimBou AI',
  authors: [{ name: 'SecRed Knowledge Inc. d/b/a NouchiX', url: 'https://nouchix.com' }],
  openGraph: {
    title: 'Proof Over Promises for AI Agents That Touch Production | KTOS',
    description: 'The execution gate and proof layer for AI agents that touch production. Signed, independently verifiable evidence for every agent action — with CMMC-grade evidence for defense contractors.',
    url: 'https://adinkhepra.com',
    siteName: 'NouchiX — KTOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KTOS — Proof Over Promises for AI Agents That Touch Production',
    description: 'The execution gate and proof layer for AI agents that touch production. Signed, independently verifiable evidence for every agent action — with CMMC-grade evidence for defense contractors.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#07090f" />
      </head>
      <body className="bg-[#07090f] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}
