const { generateMarketingInsights } = require('./video_marketer');

async function runTest() {
    const prompt = "Find me the most viral or popular video in the product category Wearable Health Technology related to Sleep Tracking, and write a viral script for the product";
    const sessionId = Math.floor(Math.random() * 1000000);

    console.log("--- Starting Unit Test ---");
    console.log("Input Prompt:", prompt);
    console.log("Session ID:", sessionId);
    console.log("--------------------------");

    try {
        const result = await generateMarketingInsights(prompt, sessionId, 'TIKTOK');

        console.log("\n--- Full API Result ---");
        // console.log(JSON.stringify(result, null, 2));

        if (result.data && result.data.msg && result.data.msg[0]) {
            const msg = result.data.msg[0];
            console.log("\n--- Extracted Summary ---");
            console.log("Video Name:", msg.video?.video_name || "N/A");
            console.log("\nRaw Marketer Output (Content):");
            console.log(msg.content);

            console.log("\n--- TikTok Reference URLs ---");
            if (result.tiktokUrls && result.tiktokUrls.length > 0) {
                result.tiktokUrls.forEach((url, i) => console.log(`${i + 1}: ${url}`));
            } else {
                console.log("No TikTok URLs retrieved.");
            }
        } else {
            console.log("\nAPI Error or Empty Response:");
            console.log(JSON.stringify(result, null, 2));
        }

    } catch (error) {
        console.error("\nTest Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

runTest();
