require('dotenv').config();
const { generateFalVideo } = require('./fal_video');

async function testFal() {
    console.log("Testing Fal.ai with key:", process.env.FAL_KEY || process.env.FAL_API_KEY ? "FOUND" : "NOT FOUND");
    try {
        const prompt = "A cinematic close up of a futuristic smart ring glowing on a wooden table, 4k, professional lighting";
        const result = await generateFalVideo([], prompt);
        console.log("Success!", result);
    } catch (err) {
        console.error("Failed:", err);
    }
}

testFal();
