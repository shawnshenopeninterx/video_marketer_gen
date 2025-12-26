const express = require('express');
const cors = require('cors');
const { scrapeProductData } = require('./scraper');
const { runCampaign } = require('./workflow');

const app = express();
const PORT = 3000;

const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// Helper to validate URL
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Explicit video route for debugging
app.get('/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'public', 'videos', filename);
    console.log(`Serving video: ${filename} from ${filepath}`);
    res.sendFile(filepath, (err) => {
        if (err) {
            console.error(`Error serving video ${filename}:`, err);
            res.status(404).send('Video not found');
        }
    });
});

// Root route for convenience
app.get('/', (req, res) => {
    res.send('<h1>VideoGen API is running 🚀</h1><p>Please visit the Frontend App at: <a href="http://localhost:5173">http://localhost:5173</a></p>');
});

// Endpoint: Scrape Data from URL
app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    try {
        const data = await scrapeProductData(url);

        if (!data.image) {
            return res.status(404).json({ error: 'No suitable image found' });
        }

        console.log(`Scraped data:`, data);
        res.json(data); // Returns { image, description, category }

    } catch (error) {
        console.error('Scraping error:', error.message);
        res.status(500).json({ error: 'Failed to scrape URL' });
    }
});

// Endpoint: Generate Video (Mock)
app.post('/api/generate', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log(`Generating video for: ${imageUrl}`);

    // Simulate processing delay
    setTimeout(() => {
        // Return a mock video URL
        const mockVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4';

        res.json({
            videoUrl: mockVideoUrl,
            status: 'completed'
        });
    }, 2000);
});

// Endpoint: Run Full Campaign with SSE for real-time logs
app.get('/api/campaign', async (req, res) => {
    const { url } = req.query;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendSSE = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        console.log(`Starting campaign for: ${url}`);

        const result = await runCampaign(url, false, (logEntry) => {
            sendSSE('log', logEntry);
        });

        if (result.status === 'success') {
            sendSSE('result', result);
        } else {
            sendSSE('error', { message: result.error });
        }
    } catch (error) {
        console.error('Campaign Error:', error);
        sendSSE('error', { message: 'Campaign failed', details: error.message });
    } finally {
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
