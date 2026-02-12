# SEO setup – step-by-step guide

Follow these steps to finish and verify your site’s SEO.

---

## Step 1: Set your production URL

Your site uses `NEXT_PUBLIC_APP_URL` for sitemap, robots, and Open Graph links. Set it to your real domain in production.

### If you deploy on Vercel

1. Open [Vercel](https://vercel.com) and sign in.
2. Open your **Businesstool** project.
3. Go to **Settings** → **Environment Variables**.
4. Find or add:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://your-domain.com` (e.g. `https://denzarc.com` — no trailing slash)
5. Choose **Production** (and Preview if you use a custom preview URL).
6. Click **Save**.
7. **Redeploy** the project (Deployments → ⋮ on latest → Redeploy) so the new value is used.

### If you deploy elsewhere (e.g. your own server)

1. In your production environment (e.g. `.env.production` or your host’s env settings), set:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```
2. Rebuild and redeploy the app.

---

## Step 2: Verify sitemap and robots after deploy

1. Deploy your site.
2. Open in a browser:
   - **Sitemap:** `https://your-domain.com/sitemap.xml`  
     You should see XML with URLs for `/`, `/about`, `/contact`, `/pricing`, `/sign-in`, `/sign-up`.
   - **Robots:** `https://your-domain.com/robots.txt`  
     You should see `User-agent: *`, `Allow: /`, `Disallow:` lines for dashboard/admin/api, and `Sitemap: https://your-domain.com/sitemap.xml`.
3. If either is missing or wrong, check that `NEXT_PUBLIC_APP_URL` is set correctly and you redeployed.

---

## Step 3 (optional): Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add a property with your site URL (e.g. `https://denzarc.com`).
3. Choose **HTML tag** as the verification method.
4. Copy the `content` value from the tag, e.g.:
   ```html
   <meta name="google-site-verification" content="abc123..." />
   ```
5. In your project, open `src/app/layout.tsx`.
6. Find the `verification` object inside `metadata` and add your code:
   ```ts
   verification: {
     google: 'abc123...',  // paste the content value here (no quotes in the value)
   },
   ```
7. Save, deploy, then in Search Console click **Verify**.

---

## Step 4 (optional): Yandex Webmaster

1. Go to [Yandex Webmaster](https://webmaster.yandex.com).
2. Add your site and get the verification meta tag.
3. Copy the `content` value from the tag.
4. In `src/app/layout.tsx`, add it to the same `verification` object:
   ```ts
   verification: {
     google: '...',
     yandex: 'your-yandex-verification-code',
   },
   ```
5. Save, deploy, then verify in Yandex.

---

## Step 5 (optional): Better Open Graph image

Right now the logo is used when your link is shared. For a nicer preview (e.g. on Twitter/Facebook), use a dedicated image.

1. **Create or pick an image**
   - Size: **1200 × 630** pixels.
   - Format: PNG or JPG.
   - Include your logo and a short tagline (e.g. “Denzarc – Small Business Tools”).

2. **Add it to the project**
   - Put the file in the `public` folder, e.g. `public/og-image.png`.

3. **Point metadata to it**
   - In `src/app/layout.tsx`, find `openGraph.images` and set:
     ```ts
     images: [
       {
         url: '/og-image.png',
         width: 1200,
         height: 630,
         alt: 'Denzarc – Small Business Tools',
       },
     ],
     ```
   - Do the same for `twitter.images` if you add a `images` field there.

4. Save and deploy. Test with:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or X’s developer tools)

---

## Step 6: Submit sitemap to search engines

### Google

1. In [Google Search Console](https://search.google.com/search-console), open your property.
2. Go to **Sitemaps** (left menu).
3. Under “Add a new sitemap”, enter: `sitemap.xml`
4. Click **Submit**.

### Bing (optional)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add your site if needed.
3. Open **Sitemaps** and submit: `https://your-domain.com/sitemap.xml`

---

## Quick checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` in production and redeploy.
- [ ] Confirm `https://your-domain.com/sitemap.xml` and `https://your-domain.com/robots.txt` work.
- [ ] (Optional) Add Google Search Console verification in `layout.tsx` and verify.
- [ ] (Optional) Add Yandex verification in `layout.tsx` and verify.
- [ ] (Optional) Add `public/og-image.png` (1200×630) and update `openGraph.images` in `layout.tsx`.
- [ ] Submit `sitemap.xml` in Google Search Console (and optionally Bing).

Once these are done, your SEO setup is in place and submitted to search engines.
