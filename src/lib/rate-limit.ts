import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

const defaultLimits: Record<string, RateLimitConfig> = {
  '/api/calculate': { windowMs: 60000, maxRequests: 10 },
  '/api/declaration': { windowMs: 60000, maxRequests: 10 },
  '/api/salary': { windowMs: 60000, maxRequests: 20 },
  '/api/ai': { windowMs: 60000, maxRequests: 5 },
  '/api/auth': { windowMs: 60000, maxRequests: 5 },
}

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : (request as any).ip || 'unknown'
  return ip
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  path?: string
) {
  return async function rateLimitedHandler(request: NextRequest): Promise<NextResponse> {
    const route = path || request.nextUrl.pathname
    const config = defaultLimits[route] || { windowMs: 60000, maxRequests: 100 }
    const clientId = getClientId(request)
    const key = `${clientId}:${route}`
    const now = Date.now()

    const current = rateLimits.get(key)

    if (!current || now > current.resetTime) {
      rateLimits.set(key, { count: 1, resetTime: now + config.windowMs })
      return handler(request)
    }

    if (current.count >= config.maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000)
      return NextResponse.json(
        { error: 'Too many requests', retryAfter },
        { 
          status: 429, 
          headers: { 
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    current.count++
    rateLimits.set(key, current)

    const response = await handler(request)
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(config.maxRequests - current.count))
    
    return response
  }
}

export function clearRateLimits() {
  rateLimits.clear()
}