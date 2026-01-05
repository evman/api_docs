const REALM = "Wallet API Docs";

interface Env {
  AUTH_USER: string;
  AUTH_PASS: string;
}

function unauthorized(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function parseBasicAuth(header: string): { user: string; pass: string } | null {
  if (!header.startsWith("Basic ")) return null;

  const base64 = header.slice(6);
  const decoded = atob(base64);
  const [user, ...passParts] = decoded.split(":");
  const pass = passParts.join(":");

  if (!user || !pass) return null;
  return { user, pass };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Skip auth if credentials not configured
  if (!env.AUTH_USER || !env.AUTH_PASS) {
    return context.next();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return unauthorized();
  }

  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    return unauthorized();
  }

  // Constant-time comparison
  const userMatch = credentials.user === env.AUTH_USER;
  const passMatch = credentials.pass === env.AUTH_PASS;

  if (!userMatch || !passMatch) {
    return unauthorized();
  }

  return context.next();
};
