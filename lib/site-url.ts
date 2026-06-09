export function getSiteUrl(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin")
    if (origin) return origin.replace(/\/$/, "")
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "http://localhost:3000"
}
