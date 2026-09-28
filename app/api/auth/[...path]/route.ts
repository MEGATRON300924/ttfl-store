import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production"
  ? "https://ttfl-store-backend.onrender.com"
  : "http://localhost:4000")).replace(/\/$/, "");

function setCookieValues(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const values = withGetSetCookie.getSetCookie?.();
  if (values?.length) return values;

  const combined = headers.get("set-cookie");
  if (!combined) return [];

  return combined
    .split(/,(?=\s*ttfl_(?:access|refresh)=)/i)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function proxyAuth(request: NextRequest, path: string[]) {
  const target = `${API_URL}/api/auth/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();

  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");
  const userAgent = request.headers.get("user-agent");

  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);
  if (userAgent) headers.set("user-agent", userAgent);

  const method = request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    responseHeaders.set("cache-control", "no-store");
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    for (const cookieValue of setCookieValues(upstream.headers)) {
      responseHeaders.append("set-cookie", cookieValue);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_BACKEND_UNAVAILABLE",
          message: "TTFL Store authentication service is temporarily unavailable. Please try again.",
        },
      },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyAuth(request, context.params.path);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyAuth(request, context.params.path);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyAuth(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyAuth(request, context.params.path);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return proxyAuth(request, context.params.path);
}