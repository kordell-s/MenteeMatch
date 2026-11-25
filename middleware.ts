import { withAuth } from "next-auth/middleware";

// Signed-in areas. Pages still check the session themselves; this keeps
// signed-out visitors from loading app screens at all.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/messages/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
