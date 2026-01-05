interface Env {
  AUTH_USER: string;
  AUTH_PASS: string;
  AUTH_SECRET: string;
}

const SESSION_COOKIE = "docs_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Wallet API Docs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo svg {
      width: 48px;
      height: 48px;
      fill: #e94560;
    }
    h1 {
      color: #fff;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 15px;
      transition: all 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #e94560;
      background: rgba(255, 255, 255, 0.12);
    }
    input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #e94560, #c23a51);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 10px;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
    }
    button:active {
      transform: translateY(0);
    }
    .error {
      background: rgba(233, 69, 96, 0.2);
      border: 1px solid rgba(233, 69, 96, 0.3);
      color: #ff6b6b;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    </div>
    <h1>Wallet API Docs</h1>
    <p class="subtitle">Enter your credentials to continue</p>
    {{ERROR}}
    <form method="POST">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" placeholder="Enter username" required autofocus>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter password" required>
      </div>
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`;

async function createSessionToken(secret: string): Promise<string> {
  const expires = Date.now() + SESSION_DURATION * 1000;
  const data = `valid:${expires}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return btoa(`${data}:${sigHex}`);
}

async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;

    const [status, expiresStr, sigHex] = parts;
    const expires = parseInt(expiresStr, 10);

    if (status !== "valid" || Date.now() > expires) return false;

    const data = `${status}:${expiresStr}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return sigHex === expectedHex;
  } catch {
    return false;
  }
}

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

function loginPage(error?: string): Response {
  const html = LOGIN_PAGE.replace(
    "{{ERROR}}",
    error ? `<div class="error">${error}</div>` : ""
  );
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Skip auth if credentials not configured
  if (!env.AUTH_USER || !env.AUTH_PASS) {
    return context.next();
  }

  // Use AUTH_SECRET or fall back to AUTH_PASS for signing
  const secret = env.AUTH_SECRET || env.AUTH_PASS;

  // Check for valid session cookie
  const sessionToken = getCookie(request, SESSION_COOKIE);
  if (sessionToken && (await verifySessionToken(sessionToken, secret))) {
    return context.next();
  }

  // Handle login form submission
  if (request.method === "POST") {
    const formData = await request.formData();
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    if (username === env.AUTH_USER && password === env.AUTH_PASS) {
      const token = await createSessionToken(secret);
      const response = new Response(null, {
        status: 302,
        headers: {
          Location: new URL(request.url).pathname,
          "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}`,
        },
      });
      return response;
    }

    return loginPage("Invalid username or password");
  }

  // Show login page
  return loginPage();
};
