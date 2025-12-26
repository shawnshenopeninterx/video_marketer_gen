const { generateMarketingInsights } = require('./video_marketer');

async function runTest() {
    const prompt = "What are the latest trends for @nike?";

    console.log('----------------------------------------');
    console.log('Testing Video Marketer API');
    console.log('----------------------------------------');

    try {
        const result = await generateMarketingInsights(prompt, 123456, 'TIKTOK');

        console.log('----------------------------------------');
        console.log('API RESPONSE SUCCESS');
        console.log('----------------------------------------');
        console.log(JSON.stringify(result, null, 2));

        if (result.data && result.data.msg) {
            console.log('\n--- AI Message Content ---');
            console.log(result.data.msg);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runTest();
