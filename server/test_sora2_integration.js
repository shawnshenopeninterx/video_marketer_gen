require('dotenv').config();
const { generateFalVideo } = require('./fal_video');
const path = require('path');

async function integrationTest() {
    console.log("--- Integrated Sora 2 Test ---");
    console.log("FAL_KEY:", process.env.FAL_KEY ? "Present" : "MISSING");

    // Testing text-to-video first to verify key and basic connection
    const mockImage = null;
    const mockPrompt = "Cinematic 9:16 vertical video of a smart doorbell on a modern house, morning light, high resolution, 4k";

    try {
        console.log("Step 1: Calling Sora 2 via fal_video.js...");
        const result = await generateFalVideo([mockImage], mockPrompt, '9:16');

        console.log("\n✅ SUCCESS!");
        console.log("Video URL:", result.videoUrl);
        console.log("Local Path:", result.localPath);
        console.log("Fal URL:", result.falUrl);
    } catch (err) {
        console.error("\n❌ FAILED!");
        if (err.body) {
            console.error("Error details:", JSON.stringify(err.body, null, 2));
        }
        if (err.status === 401) {
            console.error("Error: Unauthorized. Your FAL_KEY is invalid or not being loaded.");
        } else {
            console.error(err);
        }
    }
}

integrationTest();
