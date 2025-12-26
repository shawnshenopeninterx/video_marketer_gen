const { fal } = require("@fal-ai/client");
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configure Fal.ai with API key from environment
fal.config({
    credentials: process.env.FAL_KEY || process.env.FAL_API_KEY
});

/**
 * Download file from URL
 */
async function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

/**
 * Generate video using Fal.ai
 * Using Minimax Video-01 model for high-quality video generation
 * 
 * @param {Array} images - Array of image paths (optional, for image-to-video)
 * @param {string} prompt - Text prompt for video generation
 * @param {string} aspectRatio - Aspect ratio (default: '9:16')
 * @returns {Object} - Video URL and metadata
 */
async function generateFalVideo(images, prompt, aspectRatio = '9:16') {
    try {
        console.log(`Starting Fal.ai Video Generation...`);
        console.log(`Prompt: "${prompt}"`);
        console.log(`Aspect Ratio: ${aspectRatio}`);

        // Use Luma Dream Machine for high-quality video generation
        const model = "fal-ai/luma-dream-machine";

        const payload = {
            prompt: prompt,
            aspect_ratio: aspectRatio.includes(':') ? aspectRatio : '9:16'
        };

        // If an image is provided, add it to the payload
        if (images && images.length > 0 && images[0]) {
            console.log(`Using image input: ${images[0]}`);
            payload.image_url = images[0];
        }

        console.log('Calling Fal.ai API with model:', model);

        const result = await fal.subscribe(model, {
            input: payload,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    const lastLog = update.logs?.[update.logs.length - 1]?.message;
                    if (lastLog) console.log(`[Fal.ai] ${lastLog}`);
                }
            },
        });

        console.log('Generation complete!');
        console.log('Result:', JSON.stringify(result, null, 2));

        // Ensure public/videos directory exists
        const videoDir = path.join(__dirname, 'public', 'videos');
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }

        const filename = `fal_${Date.now()}.mp4`;
        const filePath = path.join(videoDir, filename);

        // Download the generated video
        const videoUrl = result.data?.video?.url || result.video?.url;

        if (!videoUrl) {
            throw new Error(`Video URL not found in Fal.ai response: ${JSON.stringify(result)}`);
        }

        console.log(`Downloading video from: ${videoUrl}`);
        await downloadFile(videoUrl, filePath);
        console.log(`Generated video saved to: ${filePath}`);

        // Return the relative URL path
        return {
            videoUrl: `/videos/${filename}`,
            status: 'completed',
            localPath: filePath,
            falUrl: videoUrl
        };

    } catch (error) {
        console.error('Fal.ai Generation Error:', error);
        throw error;
    }
}

module.exports = { generateFalVideo };
