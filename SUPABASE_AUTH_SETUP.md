# Supabase Authentication Setup Guide

## Overview
This guide explains how to configure Google OAuth and Email/Password authentication for the SpiritualChat application.

## Configuration Steps

### 1. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application** as the application type
6. Configure the OAuth consent screen if prompted

#### Step 2: Configure OAuth Client
Add the following URLs to your OAuth client configuration:

**Authorized JavaScript origins:**
- `http://localhost:3001` (for development)
- `https://xzmbxvndtmoedyqjtitz.supabase.co` (your Supabase project URL)

**Authorized redirect URIs:**
- `http://localhost:3001/auth/callback` (for development)
- `https://xzmbxvndtmoedyqjtitz.supabase.co/auth/v1/callback` (Supabase callback)

#### Step 3: Configure Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **SpiritualChat** (xzmbxvndtmoedyqjtitz)
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and enable it
5. Enter your Google **Client ID** and **Client Secret**
6. Copy the **Callback URL** provided by Supabase:
   ```
   https://xzmbxvndtmoedyqjtitz.supabase.co/auth/v1/callback
   ```
7. Click **Save**

### 2. Email/Password Authentication Setup

Email/Password authentication is **enabled by default** in Supabase.

#### Configuration Options
1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Find **Email** in the list
3. Configure the following options:

**Recommended Settings:**
- ✅ **Enable email confirmations** - Users must verify their email before logging in
- ✅ **Enable email change confirmations** - Require confirmation for email changes
- ⚠️ **Secure email change** - Send confirmation to both old and new email addresses

**Email Templates:**
You can customize email templates under **Authentication** > **Email Templates**:
- Confirmation email
- Password reset email
- Magic link email
- Email change confirmation

### 3. Site URL and Redirect URLs Configuration

1. Go to **Authentication** > **URL Configuration**
2. Set the **Site URL** to your production domain (or `http://localhost:3001` for development)
3. Add **Redirect URLs** to the allow list:
   ```
   http://localhost:3001/**
   http://localhost:3001/auth/callback
   https://your-production-domain.com/**
   https://your-production-domain.com/auth/callback
   ```

### 4. Security Best Practices

#### Enable MFA (Multi-Factor Authentication)
For enhanced security, consider enabling MFA:
1. Go to **Authentication** > **Settings**
2. Enable **Multi-Factor Authentication**

#### Password Policy
Configure password requirements:
1. Go to **Authentication** > **Settings**
2. Configure minimum password length (recommend: 8+ characters)

#### Rate Limiting
Supabase automatically applies rate limiting, but you can adjust:
1. Go to **Authentication** > **Settings**
2. Review rate limit settings for:
   - Sign-ups
   - Sign-ins
   - Password recovery

### 5. Identity Linking

Supabase automatically links identities with the same verified email address. This means:
- Users can sign in with Google OR email/password using the same account
- If a user signs up with Google and later adds a password, they can use either method
- Prevents duplicate accounts for the same user

**Security Note:** Identity linking only works with verified email addresses to prevent account takeover attacks.

### 6. Testing Authentication

After configuration:

1. **Test Google OAuth:**
   - Visit http://localhost:3001/login
   - Click "Sign in with Google"
   - Complete the Google sign-in flow
   - Verify redirect to the application

2. **Test Email/Password:**
   - Visit http://localhost:3001/signup
   - Enter email and password
   - Check email for confirmation link (if enabled)
   - Sign in with credentials

3. **Test Identity Linking:**
   - Sign up with Google
   - Add a password using the profile settings
   - Sign out and sign in with email/password
   - Verify same user account

## Environment Variables

Ensure `.env.local` has the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xzmbxvndtmoedyqjtitz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

## Callback Route Implementation

The callback route at `/auth/callback` handles the OAuth code exchange. This is already implemented in the codebase at:
```
app/auth/callback/route.ts
```

## Next Steps

After completing this setup:
1. ✅ Test authentication flows
2. ✅ Implement profile creation flow for new users
3. ✅ Set up protected routes
4. ✅ Configure email templates with branding
5. ✅ Enable MFA before production launch

## Troubleshooting

### Google OAuth Issues
- **Error: redirect_uri_mismatch** - Check that redirect URIs match exactly in Google Console
- **No refresh token** - Pass `access_type: 'offline'` and `prompt: 'consent'` to `signInWithOAuth()`

### Email Issues
- **Emails not sending** - Check spam folder, verify email service is configured
- **Confirmation emails not working** - Ensure email confirmations are enabled and templates are configured

### General Issues
- **PKCE flow errors** - Ensure callback route is implemented correctly
- **Cookie issues** - Check that middleware is properly configured

## Support

For more information:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Email Auth Guide](https://supabase.com/docs/guides/auth/passwords)
