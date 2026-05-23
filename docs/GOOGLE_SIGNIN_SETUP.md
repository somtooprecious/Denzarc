# Enable "Continue with Google" (Clerk + Google OAuth)

Your sign-up and sign-in pages already show the **Continue with Google** button when Google is enabled in Clerk. To make it work, complete these two steps. No code changes are required.

---

## Step 1: Enable Google in Clerk Dashboard

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and open your application.
2. In the sidebar: **Configure** → **Social connections** (or **User & Authentication** → **Social connections**).
3. Find **Google** and turn it **On**.
4. You will see:
   - **Redirect URL** (copy this; you’ll use it in Google Cloud in Step 2).
   - **Client ID** and **Client Secret** (you’ll paste these from Google Cloud).
5. Leave this tab open; you’ll paste the Client ID and Secret after creating them in Step 2.

---

## Step 2: Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and select your project (or create one).
2. Open **APIs & Services** → **Credentials**.
3. Click **Create credentials** → **OAuth client ID**.
4. If asked, set the **OAuth consent screen** (User type: External, add your app name and support email, add your email as test user if in testing mode).
5. Application type: **Web application**.
6. Under **Authorized redirect URIs**, click **Add URI** and paste the **Redirect URL** from Clerk (Step 1). It looks like:
   - `https://<your-clerk-frontend-api>/.clerk/oauth_callback`
   - or similar (Clerk shows the exact URL in the Social connections → Google section).
7. Save. Copy the **Client ID** and **Client Secret**.
8. Back in **Clerk Dashboard** → **Social connections** → **Google**, paste the **Client ID** and **Client Secret** and save.

---

## Step 3: Production domain (for live site)

If your app is live (e.g. https://www.denzarc.com):

1. In **Clerk Dashboard**: **Configure** → **Domains** (or **Paths**).
2. Add your production URL (e.g. `https://www.denzarc.com`) to the allowed list so redirects work after Google sign-in.

---

After this, **Continue with Google** will sign users up or in without changing any existing email/password behavior.
