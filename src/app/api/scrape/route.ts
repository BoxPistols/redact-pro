import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side URL scraping proxy.
 * Eliminates ALL CORS issues since the request is made server-side.
 *
 * GET /api/scrape?url=https://example.com
 */

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const limit = parseInt(process.env.SCRAPE_RATE_LIMIT || '30')
  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function GET(request: NextRequest) {
  if (process.env.SCRAPE_ENABLED === 'false') {
    return NextResponse.json({ error: 'Scraping disabled' }, { status: 403 })
  }

  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing ?url= parameter' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 }
      )
    }

    const html = await res.text()

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Scraped-URL': url,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: msg.includes('abort') ? 'Timeout (15s)' : msg },
      { status: msg.includes('abort') ? 504 : 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
