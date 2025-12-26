# 🎬 Video Gen Marketing

AI-powered video generation platform that creates viral TikTok-style marketing videos from product URLs.

## ✨ Features

- 🔍 **Smart Product Scraping** - Automatically extracts product data from URLs
- 🤖 **AI Script Generation** - Creates viral marketing scripts using Claude Sonnet
- 🎨 **Image Intelligence** - Selects or generates optimal product images with Gemini
- 🎥 **Video Generation** - Produces professional videos with Google Veo 3.1
- 📊 **Real-time Progress** - Live updates during the generation process
- 🎯 **Trend Analysis** - Leverages Memories.ai for viral content insights

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google AI API Key (for Gemini & Veo3)
- Memories.ai API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/video-gen-marketing.git
   cd video-gen-marketing
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `server/.env`:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   MEMORIES_API_KEY=your_memories_api_key
   ```

5. **Start the development servers**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm start
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to `http://localhost:5173`

## 📦 Project Structure

```
video-gen-marketing/
├── src/                    # Frontend React app
│   ├── App.jsx            # Main application component
│   ├── VideoAgent.jsx     # Video generation interface
│   └── index.css          # Styles
├── server/                # Backend Express server
│   ├── index.js          # API server
│   ├── workflow.js       # Campaign orchestration
│   ├── scraper.js        # Product data scraping
│   ├── gemini.js         # Gemini AI integration
│   ├── veo3.js           # Veo3 video generation
│   └── video_marketer.js # Script generation
├── api/                   # Vercel serverless functions
└── public/               # Static assets
```

## 🎯 How It Works

1. **Input**: Paste a product URL (Amazon, etc.)
2. **Scraping**: Extracts product details and images
3. **Analysis**: AI analyzes product and generates viral script
4. **Image Selection**: Chooses or generates optimal product image
5. **Video Generation**: Creates professional marketing video
6. **Output**: Download your viral marketing video!

## 🌐 Deployment

### Vercel (Frontend + Serverless)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
```bash
./deploy-setup.sh
```

Then follow the prompts to push to GitHub and deploy to Vercel.

⚠️ **Note**: Vercel has execution time limits. For production with long-running video generation, consider:
- **Vercel Pro** (60s timeout)
- **Railway/Render** for backend (unlimited execution time)

### Railway (Backend - Recommended for Production)

1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Set root directory to `server`
4. Add environment variables
5. Deploy!

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google AI API key for Gemini & Veo3 | Yes |
| `MEMORIES_API_KEY` | Memories.ai API key for trend analysis | Yes |

### API Endpoints

- `GET /api/campaign?url=<product_url>` - Run full campaign with SSE
- `POST /api/scrape` - Scrape product data
- `POST /api/generate` - Generate video (mock)

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Framer Motion** - Animations

### Backend
- **Node.js + Express** - API server
- **Puppeteer** - Web scraping
- **Google Gemini** - AI analysis & image generation
- **Google Veo 3.1** - Video generation
- **Memories.ai** - Trend analysis

## 📊 Development

### Run Tests
```bash
cd server
npm run test        # Test scraper
npm run test:api    # Test video marketer
npm run test:veo3   # Test Veo3 generation
npm run test:flow   # Test full workflow
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
cd server && npm install
```

### Puppeteer issues on Mac
```bash
cd server
npm install puppeteer --force
```

### Video generation timeout
- Upgrade to Vercel Pro (60s limit)
- Use Railway/Render for backend
- Implement queue-based processing

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using Google AI**
