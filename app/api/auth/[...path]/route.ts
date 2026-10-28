import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ttfl-store-backend-af5u.onrender.com").replace(/\/$/, "");

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

function persistAuthCookie(cookieValue: string, secure: boolean): string {
  const [cookiePair, ...rawAttributes] = cookieValue.split(";");
  const name = cookiePair.split("=")[0]?.trim();
  if (name !== "ttfl_access" && name !== "ttfl_refresh") return cookieValue;

  const maxAge = name === "ttfl_refresh" ? 30 * 24 * 60 * 60 : 15 * 60;
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const preserved = rawAttributes
    .map((attribute) => attribute.trim())
    .filter((attribute) => attribute && !/^(?:max-age|expires|path|secure|httponly|samesite)=?/i.test(attribute));

  return [
    cookiePair,
    ...preserved,
    "Path=/",
    `Max-Age=${maxAge}`,
    `Expires=${expires}`,
    "HttpOnly",
    ...(secure ? ["Secure"] : []),
    "SameSite=Lax",
  ].join("; ");
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

    if (path.join("/") === "handoff/exchange" && upstream.ok) {
      const data = await upstream.json().catch(() => null);
      if (!data?.accessToken || !data?.refreshToken) {
        return NextResponse.json({ message: "Invalid authentication handoff response." }, { status: 502 });
      }
      const response = NextResponse.json({ user: data.user });
      const secure = request.nextUrl.protocol === "https:";
      response.cookies.set("ttfl_access", data.accessToken, {
        httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 15 * 60,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      });
      response.cookies.set("ttfl_refresh", data.refreshToken, {
        httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return response;
    }

    const responseHeaders = new Headers();
    responseHeaders.set("cache-control", "no-store");
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);

    const secure = request.nextUrl.protocol === "https:";
    for (const cookieValue of setCookieValues(upstream.headers)) {
      responseHeaders.append("set-cookie", persistAuthCookie(cookieValue, secure));
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