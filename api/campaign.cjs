// Note: This file uses .cjs extension to work with Vercel serverless functions
// even though the main project uses ES modules

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // For now, return a simple response since the backend workflow
    // requires long-running operations that will timeout on Vercel
    // Recommend deploying backend to Railway for full functionality

    res.status(200).json({
        message: 'Campaign endpoint is available, but video generation requires a dedicated backend server (Railway/Render) due to Vercel timeout limits',
        url: url,
        recommendation: 'Deploy backend to Railway for full functionality - see QUICK_DEPLOY.md'
    });
};
