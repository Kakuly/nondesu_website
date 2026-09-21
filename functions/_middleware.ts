const ADMIN_HOSTS = new Set(["admin.nondesu.com"]);
const PUBLIC_HOSTS = new Set(["nondesu.com", "www.nondesu.com"]);

function isAdminHost(hostname: string): boolean {
  return ADMIN_HOSTS.has(hostname);
}

function isPublicHost(hostname: string): boolean {
  return PUBLIC_HOSTS.has(hostname);
}

interface MiddlewareContext {
  request: Request;
  next: () => Promise<Response>;
}

export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const url = new URL(context.request.url);
  const { pathname, search, hostname } = url;

  if (pathname.startsWith("/api/")) {
    return context.next();
  }

  if (isAdminHost(hostname)) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/assets/")) {
      if (pathname === "/admin") {
        return Response.redirect(new URL("/admin/", url).toString(), 302);
      }
      return context.next();
    }

    if (pathname === "/") {
      return Response.redirect(new URL("/admin/", url).toString(), 302);
    }

    const dest = new URL(`${pathname}${search}`, "https://nondesu.com");
    return Response.redirect(dest.toString(), 302);
  }

  if (isPublicHost(hostname)) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const suffix = pathname.slice("/admin".length) || "/";
      const dest = new URL(`/admin${suffix}${search}`, "https://admin.nondesu.com");
      return Response.redirect(dest.toString(), 302);
    }
  }

  return context.next();
}
