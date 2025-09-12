import { auth } from "@/auth";

export default auth((req) => {
  // Middleware logic is handled in auth.config.ts callbacks.authorized
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
