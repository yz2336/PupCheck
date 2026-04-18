export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",
    "/chat/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
