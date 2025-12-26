const axios = require('axios');

const API_KEY = 'b06dbf96e4cb79735c18924c6afacb6d';
const ENDPOINT = 'https://api.memories.ai/serve/api/v1/marketer_chat';

async function generateMarketingInsights(prompt, sessionId = 'default-session', type = 'TIKTOK') {
    try {
        console.log(`Calling Video Marketer API with prompt: "${prompt}"`);

        const response = await axios.post(ENDPOINT, {
            prompt,
            session_id: sessionId,
            type
        }, {
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        const tiktokUrls = [];

        // Extract video IDs from thinkings
        if (data.data && data.data.thinkings) {
            const videoIds = [];
            for (const thinking of data.data.thinkings) {
                if (thinking.refs) {
                    for (const ref of thinking.refs) {
                        if (ref.video && ref.video.video_no) {
                            videoIds.push(ref.video.video_no);
                        }
                    }
                }
            }

            // Get TikTok URLs for each video (limit to top 3 to avoid excessive calls)
            const uniqueVideoIds = [...new Set(videoIds)].slice(0, 3);
            for (const videoId of uniqueVideoIds) {
                try {
                    const detailResponse = await axios.get('https://api.memories.ai/serve/api/v1/get_public_video_detail', {
                        headers: { 'Authorization': API_KEY },
                        params: { video_no: videoId }
                    });
                    if (detailResponse.data && detailResponse.data.data && detailResponse.data.data.video_url) {
                        tiktokUrls.push(detailResponse.data.data.video_url);
                    }
                } catch (e) {
                    console.error(`Failed to fetch detail for video ${videoId}:`, e.message);
                }
            }
        }

        return {
            ...data,
            tiktokUrls
        };
    } catch (error) {
        if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', error.response.data);
        } else {
            console.error('Network/Request Error:', error.message);
        }
        throw error;
    }
}

module.exports = { generateMarketingInsights };
