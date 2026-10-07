import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://ttfl-store-backend-af5u.onrender.com";
const CARS_URL = "https://cars.ttflstore.name.ng/dashboard";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    if (!cookie) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", CARS_URL);
      return NextResponse.redirect(login);
    }

    const upstream = await fetch(`${BACKEND_URL}/api/auth/handoff/create`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data?.token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", CARS_URL);
      return NextResponse.redirect(login);
    }

    const destination = new URL(CARS_URL);
    destination.searchParams.set("handoff", data.token);
    return NextResponse.redirect(destination);
  } catch {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", CARS_URL);
    return NextResponse.redirect(login);
  }
}
