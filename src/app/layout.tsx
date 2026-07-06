import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AdinKhepra ASAF — Agentic Security Attestation Framework',
  description: 'Will you pass your CMMC audit? AdinKhepra ASAF is the sovereign, bare-metal compliance platform built for the Defense Industrial Base. Post-quantum certified. Zero egress. Air-gappable.',
  keywords: 'CMMC, STIG, NIST 800-171, compliance, DoD, DIB, post-quantum, ML-DSA-65, sovereign, SecRed, NouchiX',
  authors: [{ name: 'SecRed Knowledge Inc.', url: 'https://adinkhepra.com' }],
  openGraph: {
    title: 'AdinKhepra ASAF — Sovereign CMMC Compliance',
    description: 'The only CMMC compliance platform that is sovereign by design. Zero egress. Air-gappable. Post-quantum certified.',
    url: 'https://adinkhepra.com',
    siteName: 'AdinKhepra ASAF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdinKhepra ASAF — Sovereign CMMC Compliance',
    description: 'Post-quantum certified. Zero egress. Built for the Defense Industrial Base.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-[#0A0E1A] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
