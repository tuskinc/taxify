# Google OAuth Setup Guide

## Step 1: Create `.env.local` file

Create a `.env.local` file in the root directory of your project with the following content:

```env
VITE_SUPABASE_URL=https://fiophmtlfuqswzinckxv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3BobXRsZnVxc3d6aW5ja3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcyNDUsImV4cCI6MjA3MjM5MzI0NX0.4prqP1PkVt-6mB_dsoCfH06e0_sfXuFhE7hUmBWX5zs
```

**Note**: Make sure `.env.local` is in your `.gitignore` file to keep your keys secure.

## Step 2: Enable Google OAuth in Supabase Dashboard

1. Go to your Supabase project dashboard: https://app.supabase.com/project/fiophmtlfuqswzinckxv/auth/providers

2. Click on **"Google"** in the providers list

3. Toggle **"Enable Google provider"** to ON

4. You'll need to get credentials from Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: Add your app URL (e.g., `http://localhost:5173` for development)
   - Authorized redirect URIs: Add `https://fiophmtlfuqswzinckxv.supabase.co/auth/v1/callback`

5. Copy the **Client ID** and **Client Secret** from Google Cloud Console

6. Paste them into the Supabase Google provider settings:
   - **Client ID (for OAuth)**: Your Google OAuth Client ID
   - **Client Secret (for OAuth)**: Your Google OAuth Client Secret

7. Click **Save**

## Step 3: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration** in your Supabase dashboard

2. Add your application URLs to **Redirect URLs**:
   - For development: `http://localhost:5173/dashboard`
   - For development: `http://localhost:5173/onboarding`
   - For production: Add your production URLs when ready

3. Set the **Site URL** to your main application URL (e.g., `http://localhost:5173` for development)

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page

3. Click **"Sign in with Google"**

4. You should be redirected to Google's sign-in page

5. After signing in, you'll be redirected back to your app

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console matches: `https://fiophmtlfuqswzinckxv.supabase.co/auth/v1/callback`
- Make sure your app URLs are added to Supabase's Redirect URLs list

### Error: "invalid_client"
- Verify that the Client ID and Client Secret are correct in Supabase dashboard
- Make sure Google OAuth is enabled in Supabase

### User redirected to wrong page
- Check that the `redirectTo` option in `signInWithOAuth` matches your redirect URLs
- Verify the redirect URLs in Supabase dashboard include your app URLs

## Security Notes

- Never commit `.env.local` to version control
- Keep your Google OAuth Client Secret secure
- Use environment-specific redirect URLs (development vs production)
- Regularly rotate your OAuth credentials

