# 🚀 Vercel Deployment Guide

## ⚠️ Important Limitations

**Vercel Serverless Functions have execution time limits:**
- **Free Plan**: 10 seconds max
- **Pro Plan**: 60 seconds max

Your app performs operations that can take **several minutes**:
- Web scraping with Puppeteer
- Video generation with Veo3 (can take 2-5 minutes)

### Recommended Solution

For production deployment, consider one of these options:

1. **Hybrid Approach** (Recommended):
   - Deploy frontend on Vercel
   - Deploy backend on Railway/Render (supports long-running processes)
   
2. **Queue-based Architecture**:
   - Use Vercel for frontend + quick APIs
   - Use a job queue (e.g., Inngest, QStash) for long operations
   
3. **Full Vercel** (Limited):
   - Only works for quick operations
   - Video generation will timeout

---

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be in a Git repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **API Keys**:
   - Google AI API Key (for Gemini & Veo3)
   - Memories.ai API Key (for video marketer)

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /Users/junxiaoshen/.gemini/antigravity/scratch/video_gen_marketing
git init
git add .
git commit -m "Initial commit - Video Gen Marketing App"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., `video-gen-marketing`)
3. **Don't** initialize with README (you already have code)
4. Copy the repository URL

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/video-gen-marketing.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI (Optional but recommended)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Configure the project:

   **Framework Preset**: Vite
   
   **Root Directory**: `./` (leave as default)
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `dist`

5. Click **"Deploy"**

### 2.3 Deploy via CLI (Alternative)

```bash
cd /Users/junxiaoshen/.gemini/antigravity/scratch/video_gen_marketing
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **video-gen-marketing**
- Directory? **./`** (press Enter)
- Override settings? **N**

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Via Vercel Dashboard

1. Go to your project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

   | Name | Value |
   |------|-------|
   | `GOOGLE_API_KEY` | Your Google AI API key |
   | `MEMORIES_API_KEY` | Your Memories.ai API key |

4. Select environments: **Production**, **Preview**, **Development**
5. Click **"Save"**

### 3.2 Via CLI

```bash
vercel env add GOOGLE_API_KEY
# Paste your API key when prompted

vercel env add MEMORIES_API_KEY
# Paste your API key when prompted
```

---

## 🔄 Step 4: Redeploy with Environment Variables

After adding environment variables:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

---

## ⚡ Step 5: Test Your Deployment

1. Visit your deployment URL (e.g., `https://video-gen-marketing.vercel.app`)
2. Try the app with a product URL
3. **Note**: Long operations may timeout on Vercel

---

## 🐛 Troubleshooting

### Issue: "Function execution timed out"

**Cause**: Video generation takes too long for Vercel's limits

**Solutions**:
1. Upgrade to Vercel Pro (60s limit)
2. Use Railway/Render for backend (see Alternative Deployment below)
3. Implement queue-based processing

### Issue: "Module not found" errors

**Cause**: Server dependencies not installed

**Solution**: Ensure `server/package.json` dependencies are also in root `package.json`:

```bash
npm install @google/genai axios cheerio cors express puppeteer
```

### Issue: Puppeteer doesn't work

**Cause**: Vercel serverless doesn't support Puppeteer well

**Solution**: Use `@sparticuz/chromium` for Vercel:

```bash
npm install @sparticuz/chromium puppeteer-core
```

---

## 🔀 Alternative: Hybrid Deployment (Recommended)

### Frontend on Vercel + Backend on Railway

This is the **best approach** for your app since it has long-running operations.

#### Deploy Backend to Railway:

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Set **Root Directory**: `server`
5. Add environment variables
6. Deploy

#### Update Frontend to use Railway API:

In your Vercel project, add environment variable:
```
VITE_API_URL=https://your-app.railway.app
```

Then update `src/App.jsx` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost.

---

## 📊 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] App accessible via Vercel URL
- [ ] API endpoints working
- [ ] Long operations tested (may timeout)
- [ ] Consider Railway for backend if timeouts occur

---

## 🎯 Next Steps

1. **Test the deployment** with real product URLs
2. **Monitor function execution times** in Vercel dashboard
3. **If timeouts occur**, migrate backend to Railway/Render
4. **Set up custom domain** (optional)
5. **Enable analytics** in Vercel dashboard

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 💡 Pro Tips

1. **Use Vercel CLI** for faster deployments during development
2. **Enable Preview Deployments** for every Git push
3. **Set up automatic deployments** from your main branch
4. **Use environment variables** for all API keys (never commit them)
5. **Monitor your usage** to avoid unexpected bills

---

**Need Help?** Check the Vercel dashboard logs for detailed error messages.
