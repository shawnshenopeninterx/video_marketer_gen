require('dotenv').config();
const { generateFalVideo } = require('./fal_video');
const fs = require('fs');
const path = require('path');

async function runSora2UnitTests() {
    console.log("🚀 Starting Sora 2 Unit Tests...");

    const tests = [
        {
            name: "Text-to-Video Test",
            images: [],
            prompt: "A cinematic 9:16 video of a futuristic smart watch reflecting neon lights in a dark room, 4k",
            aspectRatio: "9:16"
        },
        {
            name: "Image-to-Video Test (Local File)",
            images: ["generated_1766805181947.png"], // Testing local upload logic
            prompt: "The camera slowly pans around the smart doorbell as it sits on a modern porch, morning light.",
            aspectRatio: "9:16"
        }
    ];

    for (const test of tests) {
        console.log(`\n--- Running: ${test.name} ---`);
        try {
            console.log(`Input Prompt: ${test.prompt}`);
            console.log(`Images: ${test.images.length > 0 ? test.images[0] : 'None'}`);

            const result = await generateFalVideo(test.images, test.prompt, test.aspectRatio);

            if (result && result.videoUrl && result.localPath) {
                console.log(`✅ ${test.name} PASSED`);
                console.log(`   Video saved to: ${result.localPath}`);
                console.log(`   Fal URL: ${result.falUrl}`);
            } else {
                throw new Error("Result structure invalid");
            }
        } catch (error) {
            console.error(`❌ ${test.name} FAILED`);
            if (error.status === 422) {
                console.error("   Error: Validation failed (Unprocessable Entity). Check if image URL is valid.");
            } else {
                console.error(`   Error: ${error.message}`);
            }
        }
    }
}

runSora2UnitTests();
