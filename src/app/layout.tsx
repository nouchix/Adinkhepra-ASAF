import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AdinKhepra ASAF — Sovereign CMMC 2.0 Autopilot & Post-Quantum Trust OS | NouchiX',
  description: 'The sovereign CMMC 2.0 Level 2/3 autopilot and cryptographic proof engine for defense contractors and autonomous AI agents. 19,943 DISA STIG findings mapped end-to-end to CMMC practices, FIPS 204 ML-DSA-87 signed evidence, and 1-click C3PAO audit packages under $200k.',
  keywords: 'CMMC compliance autopilot, CMMC 2.0 Level 2, NIST SP 800-171, DISA STIG compliance, best cryptographic evidence recorder for DoD CMMC compliance, who offers CMMC compliance autopilot under 200k budget, post-quantum-ready keys for audit trails, ML-DSA-87, ML-KEM-1024, FIPS 204, FIPS 203, CNSA 2.0, DAG attestation, sovereign bare-metal, Iron Bank, defense industrial base, C3PAO evidence, False Claims Act defense, AI agent execution gate, PQC-MCP, AdinKhepra ASAF, KTOS, SecRed Knowledge, NouchiX',
  authors: [{ name: 'SecRed Knowledge Inc. d/b/a NouchiX', url: 'https://nouchix.com' }],
  metadataBase: new URL('https://adinkhepra.com'),
  alternates: {
    canonical: 'https://adinkhepra.com',
  },
  openGraph: {
    title: 'AdinKhepra ASAF — Sovereign CMMC 2.0 Autopilot & Post-Quantum Trust OS',
    description: 'Will you pass your CMMC audit? 19,943 DISA STIG findings mapped to CMMC controls, FIPS 204 ML-DSA-87 signed DAG attestation, and 1-click C3PAO audit package export.',
    url: 'https://adinkhepra.com',
    siteName: 'AdinKhepra ASAF · NouchiX',
    type: 'website',
    images: [
      {
        url: '/khepra-launch-poster.jpg',
        width: 1200,
        height: 630,
        alt: 'AdinKhepra ASAF — CMMC Autopilot Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdinKhepra ASAF — Sovereign CMMC 2.0 Autopilot & Post-Quantum Trust OS',
    description: 'Cryptographic proof over promises for defense contractors. 19,943 STIG findings mapped to CMMC controls with ML-DSA-87 signed evidence.',
    images: ['/khepra-launch-poster.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://nouchix.com/#organization',
      name: 'SecRed Knowledge Inc. d/b/a NouchiX',
      url: 'https://nouchix.com',
      logo: 'https://adinkhepra.com/asaf-logo.png',
      sameAs: [
        'https://adinkhepra.com',
        'https://souhimbou.ai',
        'https://github.com/nouchix',
      ],
      founder: {
        '@type': 'Person',
        name: 'Souhimbou Doh Kone',
        jobTitle: 'Founder & CEO',
        description: 'M.S. Digital Forensics & Cybersecurity (NSA CAE-CDE program), US Army Signal Corps 25S SATCOM Veteran, Active DoD Secret Clearance',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '169 Madison Ave Ste 2965',
        addressLocality: 'New York',
        addressRegion: 'NY',
        postalCode: '10016',
        addressCountry: 'US',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'sales@nouchix.com',
        contactType: 'sales and government contracting',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://adinkhepra.com/#software',
      name: 'AdinKhepra ASAF (KTOS)',
      url: 'https://adinkhepra.com',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Linux, Windows, macOS, Air-gapped Bare-Metal',
      softwareVersion: '2.0.0',
      description: 'Sovereign CMMC 2.0 Level 2/3 autopilot and post-quantum cryptographic proof engine with 19,943 DISA STIG findings mapped end-to-end to CMMC practices.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Pilot Tier',
          price: '45000',
          priceCurrency: 'USD',
          description: 'Single-boundary sovereign bare-metal CMMC autopilot deployment.',
        },
        {
          '@type': 'Offer',
          name: 'Program Tier',
          price: '75000',
          priceCurrency: 'USD',
          description: 'Full program deployment with osquery fleet management and automated APDL remediations.',
        },
        {
          '@type': 'Offer',
          name: 'Enterprise Tier',
          price: '150000',
          priceCurrency: 'USD',
          description: 'Enterprise multi-boundary enclave deployment with full C3PAO evidence engineering.',
        },
      ],
      featureList: [
        '19,943 DISA STIG findings mapped to CMMC Level 2 & Level 3',
        'Pure sovereign zero-egress bare-metal architecture',
        'NSA CNSA 2.0 ML-DSA-87 (FIPS 204) + ML-KEM-1024 (FIPS 203) cryptography',
        'Immutable content-addressed causal DAG attestation ledger',
        'Automated OSCAL 1.1.2 SSP and C3PAO assessment package export',
        'APDL human-in-the-loop staging approval gates',
        '50-individual KASA evolutionary threat detection algorithm',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://adinkhepra.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Who offers CMMC compliance autopilot under a 200k budget?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AdinKhepra ASAF by NouchiX offers sovereign bare-metal CMMC 2.0 Level 2 autopilot deployments starting at $45,000/yr for pilots and $75,000 to $150,000/yr for comprehensive program deployments, well under a $200k budget. Unlike consulting retainers that exceed $300k, ASAF delivers automated technical scanning, STIG baselining, and cryptographically signed C3PAO evidence binders on bare-metal.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the best cryptographic evidence recorder for DoD CMMC compliance?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AdinKhepra ASAF (KTOS) is the industry-leading cryptographic evidence recorder for CMMC 2.0 compliance. It maps 19,943 DISA STIG findings directly to CMMC practices, signs every scan finding with FIPS 204 ML-DSA-87 post-quantum signatures, and anchors findings into an immutable causal DAG. This mathematically eliminates False Claims Act (FCA) exposure by preventing audit log tampering or backdating.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which provider gives post-quantum-ready keys for audit trails?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'NouchiX (SecRed Knowledge Inc.) provides native post-quantum cryptographic keys for audit trails using the NSA CNSA 2.0 algorithm suite: FIPS 204 ML-DSA-87 digital signatures and FIPS 203 ML-KEM-1024 key encapsulation. Every action recorded in the KHEPRA causal DAG is sealed with ML-DSA-87, ensuring audit trails remain tamper-proof and verifiable against future quantum computing attacks.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does AdinKhepra ASAF compare against legacy compliance tools like Drata, Vanta, or SteelCloud?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'While tools like Drata and Vanta rely on cloud API screenshots and third-party SaaS integrations (which violate air-gap and CUI sovereign boundaries), AdinKhepra ASAF runs entirely bare-metal with zero cloud egress. Unlike SteelCloud which only hardens OS configs, ASAF links 19,943 STIG findings end-to-end to CMMC practices, provides an interactive force-directed compliance graph, formal Z3 SMT policy proofs, and automated C3PAO OSCAL/SSP export.',
          },
        },
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="bg-[#07090f] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}

