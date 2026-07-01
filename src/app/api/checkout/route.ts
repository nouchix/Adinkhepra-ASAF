import { NextRequest, NextResponse } from 'next/server'

const STRIPE_API = 'https://api.stripe.com/v1'

/**
 * POST /api/checkout
 *
 * ASAF-specific Stripe Checkout Session creator.
 * Accepts { plan, email, loggedIn? } — routes to the correct price ID and mode.
 *
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CANONICAL ASAF STRIPE PRICE IDs — SecRed Knowledge Inc. / adinkhepra.com  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  advisory          → price_1ToLStDqGyad2D3V3EhostGw  $5,000    one-time    ║
 * ║  pilot             → price_1ToL8YDqGyad2D3VeAqysC9n  $45,000   one-time    ║
 * ║  program_std       → price_1ToLCLDqGyad2D3V2Q1FVfb4  $75,000   one-time    ║
 * ║  program_adv       → price_1ToLGbDqGyad2D3V0SFQJGdQ  $120,000  one-time    ║
 * ║  enterprise        → price_1ToLJaDqGyad2D3VROEhndOP  $150,000  one-time    ║
 * ║  enterprise_multi  → price_1ToLN8DqGyad2D3VFMeAmiWC  $250,000  one-time    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Required env vars (Vercel):
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_APP_URL  (defaults to https://adinkhepra.com)
 */

type StripePlan = {
  envKey:          string
  fallbackPriceId: string    // canonical — only used if env var not set
  mode:            'payment' | 'subscription'
  label:           string
  successPath:     string
  anonSuccessPath: string
}

const ASAF_PLANS: Record<string, StripePlan> = {
  advisory: {
    envKey:          'STRIPE_PRICE_ASAF_ADVISORY',
    fallbackPriceId: 'price_1ToLStDqGyad2D3V3EhostGw',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Remediation Advisory',
    successPath:     '/onboarding?plan=advisory&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=advisory&session_id={CHECKOUT_SESSION_ID}',
  },
  pilot: {
    envKey:          'STRIPE_PRICE_ASAF_PILOT',
    fallbackPriceId: 'price_1ToL8YDqGyad2D3VeAqysC9n',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Pilot Deployment',
    successPath:     '/onboarding?plan=pilot&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=pilot&session_id={CHECKOUT_SESSION_ID}',
  },
  program_std: {
    envKey:          'STRIPE_PRICE_ASAF_PROGRAM_STD',
    fallbackPriceId: 'price_1ToLCLDqGyad2D3V2Q1FVfb4',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Program (Standard)',
    successPath:     '/onboarding?plan=program_std&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=program_std&session_id={CHECKOUT_SESSION_ID}',
  },
  program_adv: {
    envKey:          'STRIPE_PRICE_ASAF_PROGRAM_ADV',
    fallbackPriceId: 'price_1ToLGbDqGyad2D3V0SFQJGdQ',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Program (Advanced)',
    successPath:     '/onboarding?plan=program_adv&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=program_adv&session_id={CHECKOUT_SESSION_ID}',
  },
  enterprise: {
    envKey:          'STRIPE_PRICE_ASAF_ENTERPRISE',
    fallbackPriceId: 'price_1ToLJaDqGyad2D3VROEhndOP',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Enterprise',
    successPath:     '/onboarding?plan=enterprise&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=enterprise&session_id={CHECKOUT_SESSION_ID}',
  },
  enterprise_multi: {
    envKey:          'STRIPE_PRICE_ASAF_ENTERPRISE_MULTI',
    fallbackPriceId: 'price_1ToLN8DqGyad2D3VFMeAmiWC',
    mode:            'payment',
    label:           'AdinKhepra ASAF — Enterprise Multi-Site',
    successPath:     '/onboarding?plan=enterprise_multi&session_id={CHECKOUT_SESSION_ID}',
    anonSuccessPath: '/onboarding?plan=enterprise_multi&session_id={CHECKOUT_SESSION_ID}',
  },
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://adinkhepra.com'

  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Contact sales@adinkhepra.com' },
      { status: 500 }
    )
  }

  const body    = await req.json().catch(() => ({}))
  const email   = typeof body.email === 'string' ? body.email.trim() : undefined
  const planKey = (typeof body.plan === 'string' ? body.plan : 'pilot').toLowerCase()

  const plan = ASAF_PLANS[planKey] ?? ASAF_PLANS.pilot

  const successPath = plan.successPath
  const priceId     = process.env[plan.envKey] || plan.fallbackPriceId

  const params = new URLSearchParams({
    mode:                         plan.mode,
    'success_url':                `${appUrl}${successPath}`,
    'cancel_url':                 `${appUrl}/pricing?cancelled=1`,
    'allow_promotion_codes':      'true',
    'billing_address_collection': 'required',
    'phone_number_collection[enabled]': 'true',
  })

  // Pre-fill customer fields
  if (email) params.set('customer_email', email)

  // Custom fields for ASAF context
  params.set('custom_fields[0][key]',            'organization_name')
  params.set('custom_fields[0][label][type]',    'custom')
  params.set('custom_fields[0][label][custom]',  'Organization / Company Name')
  params.set('custom_fields[0][type]',           'text')
  params.set('custom_fields[0][optional]',       'false')

  params.set('custom_fields[1][key]',            'cage_code')
  params.set('custom_fields[1][label][type]',    'custom')
  params.set('custom_fields[1][label][custom]',  'CAGE Code (if known)')
  params.set('custom_fields[1][type]',           'text')
  params.set('custom_fields[1][optional]',       'true')

  params.set('line_items[0][price]',    priceId)
  params.set('line_items[0][quantity]', '1')

  // Metadata for webhook → license generation
  params.set('metadata[asaf_plan]',    planKey)
  params.set('metadata[product_label]', plan.label)
  params.set('metadata[source]',       'adinkhepra.com')

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${stripeKey}:`).toString('base64')}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const msg = (data as any)?.error?.message || `Stripe error ${response.status}`
    console.error(`[asaf-checkout] plan=${planKey} price=${priceId} error:`, msg)
    return NextResponse.json({ error: msg }, { status: response.status })
  }

  return NextResponse.json({ url: (data as any).url })
}
