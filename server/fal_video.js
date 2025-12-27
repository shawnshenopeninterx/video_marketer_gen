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

        // Use Sora 2 for high-quality video generation
        let model = "fal-ai/sora-2/text-to-video";

        const payload = {
            prompt: prompt,
        };

        // If an image is provided, use image-to-video
        if (images && images.length > 0 && images[0]) {
            let imageUrl = images[0];

            // If the image is local (localhost or relative path), upload it to fal.ai storage
            if (imageUrl.includes('localhost') || imageUrl.startsWith('/')) {
                console.log(`Detected local image, uploading to fal.ai storage: ${imageUrl}`);
                try {
                    // Extract local path
                    let localImagePath;
                    if (imageUrl.includes('localhost')) {
                        const fileName = imageUrl.split('/').pop();
                        localImagePath = path.join(__dirname, 'public', fileName);
                    } else {
                        localImagePath = path.join(__dirname, 'public', imageUrl);
                    }

                    if (fs.existsSync(localImagePath)) {
                        const fileBuffer = fs.readFileSync(localImagePath);
                        imageUrl = await fal.storage.upload(fileBuffer);
                        console.log(`Image uploaded successfully to fal.ai storage: ${imageUrl}`);
                    }
                } catch (uploadErr) {
                    console.error("Fal.ai storage upload failed:", uploadErr);
                    // Fall back to original URL if upload fails
                }
            }

            console.log(`Using image input for Sora 2: ${imageUrl}`);
            model = "fal-ai/sora-2/image-to-video";
            payload.image_url = imageUrl;
            // image-to-video often takes resolution/aspect from the source image
        } else {
            // text-to-video supports aspect_ratio
            payload.aspect_ratio = aspectRatio.includes(':') ? aspectRatio : '9:16';
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
