import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // accessToken در localStorage ذخیره می‌شود و proxy به آن دسترسی ندارد.
  // بک‌اند بعد از ورود، refreshToken را به‌صورت HttpOnly cookie تنظیم می‌کند.
  const token = request.cookies.get("refreshToken");

  const isBuilderRoute = request.nextUrl.pathname.startsWith("/builder");

  if (isBuilderRoute && !token) {
    return NextResponse.redirect(
      new URL("/auth", request.url)
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/builder/:path*",
  ],
};
