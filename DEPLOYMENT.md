# Deployment Guide

## Deploying to Netlify

### Option 1: Deploy via Netlify Dashboard (Recommended for beginners)

1. **Build your project locally first** (to test):
   ```bash
   npm run build
   ```

2. **Create a Netlify account**:
   - Go to [netlify.com](https://netlify.com) and sign up (free)

3. **Deploy via Netlify Dashboard**:
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository (GitHub, GitLab, or Bitbucket)
   - Or drag and drop the `dist` folder directly

4. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These should auto-detect from `netlify.toml`

5. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add these variables:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key

6. **Redeploy** after adding environment variables

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize and deploy**:
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set environment variables**:
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here"
   ```

5. **Redeploy**:
   ```bash
   netlify deploy --prod
   ```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

## Important Notes

- **Never commit `.env` files** to Git (they're in `.gitignore`)
- Environment variables in Netlify are encrypted and secure
- After deployment, your site will have a URL like: `https://your-site-name.netlify.app`
- You can add a custom domain in Netlify settings

## Alternative Deployment Options

### Vercel
- Similar to Netlify
- Connect GitHub repo
- Add environment variables in dashboard
- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages
- Requires additional configuration for SPA routing
- Free but more complex setup

### Other Options
- AWS Amplify
- Cloudflare Pages
- Railway
- Render

## Testing Before Deployment

1. Test locally:
   ```bash
   npm run build
   npm run preview
   ```

2. Check that the build succeeds without errors

3. Verify environment variables are set correctly

