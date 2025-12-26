const { runCampaign } = require('../server/workflow');

// Helper to validate URL
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

        // WARNING: Vercel has a 60-second timeout on Pro plan, 10s on Free
        // This operation may timeout for long-running video generation
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
};
