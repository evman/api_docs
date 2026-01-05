# Deployment Guide

Deploy your API documentation to Cloudflare Pages with password protection.

## Prerequisites

- GitHub account
- Cloudflare account (free)
- Domain with nameservers pointed to Cloudflare

---

## Step 1: Push to GitHub

```bash
# Initialize git repo
cd wallet-api-docs
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then push
git remote add origin git@github.com:YOUR_ORG/wallet-api-docs.git
git branch -M main
git push -u origin main
```

---

## Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **Create application** → **Pages**
4. Click **Connect to Git**
5. Select your GitHub repository
6. Configure build settings:

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

7. Click **Save and Deploy**

---

## Step 3: Add Custom Domain

1. After deployment, go to your Pages project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `docs.yourcasino.com`)
5. Cloudflare will automatically configure DNS

---

## Step 4: Add Password Protection (Cloudflare Access)

### Option A: Email OTP (Recommended)

1. Go to **Zero Trust** in Cloudflare dashboard
2. Navigate to **Access** → **Applications**
3. Click **Add an application** → **Self-hosted**
4. Configure:

| Field | Value |
|-------|-------|
| Application name | API Docs |
| Subdomain | docs |
| Domain | yourcasino.com |

5. Add policy:

| Field | Value |
|-------|-------|
| Policy name | Team Access |
| Action | Allow |
| Include | Emails ending in `@yourcompany.com` |

6. Save

Now users must verify their email to access the docs.

### Option B: Simple Password (One-Time PIN)

1. In Zero Trust → **Access** → **Applications**
2. Create application as above
3. Add policy with **One-time PIN**:

| Field | Value |
|-------|-------|
| Policy name | PIN Access |
| Action | Allow |
| Include | Everyone |
| Require | One-time PIN |

4. Set allowed emails or "Any email" for PIN delivery

---

## Step 5: Verify Deployment

1. Visit your custom domain (e.g., `https://docs.yourcasino.com`)
2. You should see the Cloudflare Access login page
3. Enter your email → receive code → access granted
4. Documentation site loads

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Updating Documentation

1. Edit markdown files in `src/content/docs/`
2. Commit and push to GitHub
3. Cloudflare Pages automatically rebuilds and deploys

```bash
git add .
git commit -m "Update API documentation"
git push
```

Deployment takes ~1-2 minutes.

---

## Project Structure

```
wallet-api-docs/
├── astro.config.mjs      # Astro + Starlight config
├── package.json          # Dependencies
├── wrangler.toml         # Cloudflare config
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── styles/
│   │   └── custom.css
│   └── content/
│       └── docs/
│           ├── index.mdx           # Home page
│           ├── authentication.mdx  # Auth docs
│           ├── chains.mdx          # Supported chains
│           ├── wallets/            # Wallet endpoints
│           ├── addresses/          # Address endpoints
│           ├── payments/           # Payment endpoints
│           ├── webhooks/           # Webhook docs
│           ├── errors.mdx          # Error codes
│           ├── rate-limits.mdx     # Rate limits
│           └── sdks.mdx            # SDK examples
```

---

## Troubleshooting

### Build fails

Check that all dependencies are installed:
```bash
rm -rf node_modules
npm install
npm run build
```

### Access protection not working

1. Verify the application domain matches exactly
2. Check that the policy is set to "Allow" not "Block"
3. Ensure emails are in the correct format

### Custom domain not resolving

1. Check DNS is configured (CNAME to pages.dev URL)
2. Wait up to 24 hours for DNS propagation
3. Verify SSL/TLS is set to "Full" in Cloudflare

---

## Security Checklist

- [ ] Access protection enabled
- [ ] Only team emails allowed
- [ ] robots.txt blocks indexing (already configured)
- [ ] No real API keys in examples
- [ ] HTTPS enforced (automatic)
