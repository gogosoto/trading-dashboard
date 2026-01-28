#!/bin/bash

# Trading Dashboard - GitHub Setup Script

echo "🚀 Wyckoff + VPA Trading Dashboard - GitHub Setup"
echo "=================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) is not installed."
    echo "   Install from: https://cli.github.com/"
    echo "   Or install via: brew install gh"
    echo ""
    echo "📝 Alternative: Manually create repo at https://github.com/new"
    echo ""
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "🎯 Initial commit: Wyckoff + VPA Trading Dashboard

- Multi-timeframe analysis (D1 → H4 → H1)
- Confidence scoring system
- Telegram alerts for semi-auto trading
- Beautiful dark-mode dashboard
- GUI-based settings page"
    echo ""
else
    echo "✅ Git repository already initialized"
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "📝 Creating GitHub repository..."
    echo ""
    echo "Options:"
    echo "1. Run: gh repo create trading-dashboard --public --source=."
    echo "2. Or manually create at: https://github.com/new"
    echo ""
    read -p "Would you like me to create the repo using gh CLI? (y/n): " create_repo
    
    if [ "$create_repo" = "y" ] || [ "$create_repo" = "Y" ]; then
        gh repo create trading-dashboard --public --source=. --description "Wyckoff + VPA Trading Dashboard with multi-timeframe analysis"
        echo ""
        echo "🔗 Repository created!"
        echo ""
        read -p "Push to GitHub? (y/n): " push_repo
        
        if [ "$push_repo" = "y" ] || [ "$push_repo" = "Y" ]; then
            git push -u origin main
            echo ""
            echo "✅ Pushed to GitHub!"
        fi
    fi
else
    echo "✅ Remote 'origin' already configured"
    echo ""
    read -p "Push to GitHub? (y/n): " push_now
    
    if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
        git push origin main
        echo ""
        echo "✅ Pushed to GitHub!"
    fi
fi

echo ""
echo "=================================================="
echo "📋 Next Steps:"
echo ""
echo "1. 🌐 Deploy to Cloudflare Pages:"
echo "   - Go to: https://pages.cloudflare.com"
echo "   - Connect your GitHub repo"
echo "   - Build command: npm run build"
echo "   - Build output: .next"
echo ""
echo "2. ⚙️ Configure environment variables in Cloudflare:"
echo "   - OANDA_API_KEY"
echo "   - OANDA_ACCOUNT_ID"
echo "   - TELEGRAM_BOT_TOKEN"
echo "   - TELEGRAM_CHAT_ID"
echo ""
echo "3. 🔗 Your dashboard will be at:"
echo "   https://trading-dashboard.pages.dev"
echo ""
echo "=================================================="
