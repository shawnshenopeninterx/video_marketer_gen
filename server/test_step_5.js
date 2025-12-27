require('dotenv').config();
const { selectBestImage } = require('./gemini');
const { generateFalVideo } = require('./fal_video');

async function testStep5() {
    console.log("🚀 Testing Workflow Step 5: Video Generation");

    // Mock Data based on a real product (e.g., a smart doorbell)
    const productData = {
        category: "Smart Home Security",
        productName: "Arlo Video Doorbell",
        description: "A high-definition smart doorbell with night vision, two-way audio, and motion detection. See who is at your door from anywhere with your smartphone.",
        images: [
            "https://m.media-amazon.com/images/I/41-R-D8u4pL._AC_SL1000_.jpg",
            "https://m.media-amazon.com/images/I/61m9E5W67vL._AC_SL1500_.jpg"
        ]
    };

    const script = `[Scene 1]: Visual: Close-up of the doorbell on a modern house wall. (Audio: "Stop wondering who's at your door.")
[Scene 2]: Visual: A person checking their phone and seeing a clear video of a delivery driver. (Audio: "With Arlo, you're always home.")`;

    console.log("\n--- Step 5.1: Image Selection ---");
    try {
        const mainImage = await selectBestImage(productData.images, productData.description);
        console.log(`✅ Selected Image: ${mainImage}`);

        console.log("\n--- Step 5.2: Prompt Construction ---");
        const videoPrompt = `Create a high-energy, viral 9:16 TikTok advertisement for this product: ${productData.category}. 
        Product Description: ${productData.description}. 
        Follow this script flow: ${script.replace(/\[.*?\]/g, '').substring(0, 500)}. 
        Visual Style: Cinematic, high-fidelity, vibrant lighting, professional product showcase.`;
        console.log(`✅ Video Prompt: ${videoPrompt}`);

        console.log("\n--- Step 5.3: Video Generation with Sora 2 ---");
        const videoResult = await generateFalVideo([mainImage], videoPrompt, '9:16');

        console.log("\n==================================================");
        console.log("✅ STEP 5 PASSED");
        console.log("==================================================");
        console.log(`Status: ${videoResult.status}`);
        console.log(`Local Path: ${videoResult.localPath}`);
        console.log(`Fal URL: ${videoResult.falUrl}`);
        console.log(`Relative URL: ${videoResult.videoUrl}`);

    } catch (error) {
        console.error("\n==================================================");
        console.error("❌ STEP 5 FAILED");
        console.error("==================================================");
        console.error(`Error Type: ${error.name}`);
        console.error(`Error Message: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testStep5();
