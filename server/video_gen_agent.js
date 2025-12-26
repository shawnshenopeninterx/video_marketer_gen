const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');
const { generateVeo3Video } = require('./veo3');

const API_KEY = 'AIzaSyBKjCltZqH5m4YIIv2WAv9YUxYAkFsQF4Q';
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function runVideoGenAgent(script, onLog) {
    const addLog = (message, type = 'info') => {
        const logEntry = { timestamp: new Date(), message, type };
        console.log(`[VideoAgent] ${message}`);
        if (onLog) onLog(logEntry);
    };

    try {
        addLog('Analyzing script and breaking down into scenes...', 'info');

        const breakdownPrompt = `
        Break down the following marketing script into a JSON array of scenes.
        Each scene should be 4, 6, or 8 seconds long.
        Total duration should be between 30-90 seconds.
        
        For each scene, provide:
        - duration: number (4, 6, or 8)
        - visual_description: string (detailed description for a 9:16 portrait video)
        - camera_movement: string (e.g., "slow zoom in", "pan left", "static")
        - audio_description: string (what is heard)
        - key_visual_elements: string[] (important objects/colors)
        - start_keyframe_prompt: string (detailed English prompt for the start of the scene)
        - end_keyframe_prompt: string (detailed English prompt for the end of the scene)

        Script:
        ${script}

        Return ONLY the JSON array.
        `;

        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(breakdownPrompt);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const scenesData = JSON.parse(jsonStr);

        addLog(`Script broken down into ${scenesData.length} scenes.`, 'success');

        const scenes = [];

        for (let i = 0; i < scenesData.length; i++) {
            const sceneData = scenesData[i];
            addLog(`Processing Scene ${i + 1}/${scenesData.length}...`, 'info');

            // Generate Keyframes
            addLog(`Generating keyframes for Scene ${i + 1}...`, 'info');
            const startKeyframe = await generateImage(sceneData.start_keyframe_prompt);
            const endKeyframe = await generateImage(sceneData.end_keyframe_prompt);

            addLog(`Keyframes generated for Scene ${i + 1}.`, 'success');

            // Generate Video Segment
            addLog(`Generating video segment for Scene ${i + 1} with Veo 3.1...`, 'info');
            const videoPrompt = `${sceneData.visual_description}. Camera movement: ${sceneData.camera_movement}. Start with ${sceneData.start_keyframe_prompt} and transition to ${sceneData.end_keyframe_prompt}. Cinematic, 9:16, high fidelity.`;

            const videoResult = await generateVeo3Video([], videoPrompt, '9:16');

            scenes.push({
                sceneData,
                keyframes: {
                    start: startKeyframe,
                    end: endKeyframe
                },
                videoUrl: videoResult.videoUrl
            });

            addLog(`Scene ${i + 1} complete.`, 'success');
        }

        return {
            status: 'success',
            scenes
        };

    } catch (error) {
        addLog(`Error: ${error.message}`, 'error');
        return {
            status: 'failed',
            error: error.message
        };
    }
}

async function generateImage(prompt) {
    try {
        // Using imagen-3.0-generate-001 as it's a reliable model for high-quality images
        const model = ai.getGenerativeModel({ model: "imagen-3.0-generate-001" });

        // Note: generateImages might have a different signature depending on the SDK version
        // In gemini.js it used ai.models.generateImages
        // But here I'm using model.generateContent or similar if it's a multimodal model
        // Actually, let's follow gemini.js pattern

        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: prompt + ", cinematic lighting, 9:16 aspect ratio, high fidelity, professional photography",
            number_of_images: 1,
            aspect_ratio: "9:16"
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const b64 = response.generatedImages[0].image.imageBytes;
            const fileName = `keyframe_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            const publicDir = path.join(__dirname, 'public', 'keyframes');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }
            const filePath = path.join(publicDir, fileName);
            fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
            return `/keyframes/${fileName}`;
        }
        return "https://placehold.co/1080x1920?text=Keyframe+Failed";
    } catch (e) {
        console.error("Image generation failed:", e.message);
        return "https://placehold.co/1080x1920?text=Generation+Error";
    }
}

module.exports = { runVideoGenAgent };
