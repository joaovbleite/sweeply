# 🚀 Supabase Setup Guide for Sweeply

This guide will help you set up Supabase authentication for your Sweeply application.

## 📋 Prerequisites

- Node.js installed
- Supabase CLI installed ✅ (already done)
- A GitHub account (recommended for Supabase signup)

## 🌐 Option 1: Cloud Supabase (Recommended)

### Step 1: Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub** (recommended) or email
4. **Create a new project:**
   - Project name: `sweeply`
   - Database password: Choose a strong password (save this!)
   - Region: Choose closest to your users

### Step 2: Get Your Project Credentials

1. **Go to your project dashboard**
2. **Navigate to Settings → API**
3. **Copy these values:**
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon (public) key** (long JWT token starting with `eyJ...`)

### Step 3: Update Environment Variables

1. **Open `.env.local` in your project root**
2. **Replace the placeholder values:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key
```

### Step 4: Configure Authentication

1. **In your Supabase dashboard, go to Authentication → Settings**
2. **Configure Site URL:**
   - Add `http://localhost:4000` for development
   - Add your production URL when deploying
3. **Configure Redirect URLs:**
   - Add `http://localhost:4000/dashboard` for development
   - Add your production dashboard URL when deploying

### Step 5: Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit `http://localhost:4000/signup`**
3. **Create a test account**
4. **Check your email for verification (if enabled)**
5. **Try logging in at `http://localhost:4000/login`**

## 🏠 Option 2: Local Supabase (Development Only)

If you prefer to develop completely offline:

### Step 1: Initialize Local Supabase

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase stack
supabase start
```

### Step 2: Use Local Credentials

After running `supabase start`, you'll get local credentials. Update your `.env.local`:

```env
# Local Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Step 3: Access Local Dashboard

- **Supabase Studio:** `http://127.0.0.1:54323`
- **Database URL:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Check if email confirmation is required
   - Verify your credentials are correct

2. **"Network error"**
   - Check your Supabase URL and key
   - Ensure your project is active

3. **"CORS error"**
   - Add your domain to allowed origins in Supabase dashboard

### Environment Variables Not Loading:

1. **Restart your development server** after changing `.env.local`
2. **Check file name** - it should be `.env.local` (not `.env`)
3. **Verify syntax** - no spaces around the `=` sign

## 🎯 Next Steps

Once Supabase is set up:

1. **Test authentication** with signup/login
2. **Explore the dashboard** - your users will appear in Authentication → Users
3. **Set up database tables** for your cleaning business data
4. **Configure email templates** for better user experience

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Auth Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

---

**Need help?** Check the Supabase documentation or create an issue in this repository. 
 
 
 