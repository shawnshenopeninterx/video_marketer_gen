const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// API Key provided by user
const API_KEY = 'AIzaSyBKjCltZqH5m4YIIv2WAv9YUxYAkFsQF4Q';

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateVeo3Video(images, prompt, aspectRatio = '9:16') {
    try {
        console.log(`Starting Veo3 Generation...`);
        console.log(`Prompt: "${prompt}"`);

        // Note: The current snippet only shows text-to-video. 
        // If image input is supported by the SDK/Model in the future, we would add it here.
        // For now, we rely on the prompt.

        let operation = await ai.models.generateVideos({
            model: "veo-3.1-generate-preview",
            prompt: prompt,
            config: {
                aspect_ratio: "9:16"
            }
        });

        console.log('Operation started. Polling for completion...');

        // Poll the operation status until the video is ready.
        while (!operation.done) {
            console.log("Waiting for video generation to complete...");
            await new Promise((resolve) => setTimeout(resolve, 5000)); // 5s poll interval
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${JSON.stringify(operation.error)}`);
        }

        console.log('Generation complete. Operation details:', JSON.stringify(operation, null, 2));

        // Ensure public/videos directory exists
        const videoDir = path.join(__dirname, 'public', 'videos');
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }

        const filename = `veo3_${Date.now()}.mp4`;
        const filePath = path.join(videoDir, filename);

        // Check for the correct path in the response
        const videoFile = operation.response?.generatedVideos?.[0]?.video || operation.result?.generatedVideos?.[0]?.video;

        if (!videoFile) {
            throw new Error(`Video file not found in operation response: ${JSON.stringify(operation)}`);
        }

        // Download the generated video
        await ai.files.download({
            file: videoFile,
            downloadPath: filePath,
        });

        console.log(`Generated video saved to: ${filePath}`);

        // Return the relative URL path
        return {
            videoUrl: `/videos/${filename}`,
            status: 'completed',
            localPath: filePath
        };

    } catch (error) {
        console.error('Veo3 Generation Error:', error);
        throw error;
    }
}

module.exports = { generateVeo3Video };
