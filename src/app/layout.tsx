import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KTOS — Khepra Trust OS | NouchiX',
  description: 'The proof-and-actuation operating system for autonomous AI agents and regulated defense infrastructure. Sovereign, post-quantum, and mathematically verifiable.',
  keywords: 'KTOS, Khepra Trust OS, CMMC, STIG, NIST 800-171, AI agent security, post-quantum, ML-DSA-65, sovereign, SecRed, NouchiX, AdinKhepra ASAF, SouHimBou AI',
  authors: [{ name: 'SecRed Knowledge Inc. d/b/a NouchiX', url: 'https://nouchix.com' }],
  openGraph: {
    title: 'KTOS — Khepra Trust OS | The Sovereign AI Trust Platform',
    description: 'Detect. Prove. Remediate. Every AI agent action mathematically attested with ML-DSA-65. The only platform that closes the loop across AI agents AND bare-metal infrastructure.',
    url: 'https://adinkhepra.com',
    siteName: 'NouchiX — KTOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KTOS — Khepra Trust OS | NouchiX',
    description: 'Post-quantum AI trust. Sovereign by design. Patent-pending KHEPRA Protocol.',
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
