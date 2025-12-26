#!/bin/bash

echo "🚀 Video Gen Marketing - Vercel Deployment Setup"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules
server/node_modules

# Environment variables
.env
.env.local
.env.production

# Build output
dist
server/public/videos
server/public/*.png
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

# Stage all files
echo ""
echo "📦 Staging files for commit..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - Video Gen Marketing App" || echo "ℹ️  No changes to commit"

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   → Go to https://github.com/new"
echo "   → Name: video-gen-marketing"
echo "   → Don't initialize with README"
echo ""
echo "2. Push your code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/video-gen-marketing.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   → Go to https://vercel.com/new"
echo "   → Import your GitHub repository"
echo "   → Add environment variables (GOOGLE_API_KEY, MEMORIES_API_KEY)"
echo "   → Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "=================================================="
