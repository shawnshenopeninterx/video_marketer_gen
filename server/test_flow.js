const { runCampaign } = require('./workflow');

async function runTest() {
    const TEST_URL = 'https://memories.ai/luci/';

    console.log('----------------------------------------');
    console.log('Testing Full Campaign Workflow');
    console.log('----------------------------------------');

    const result = await runCampaign(TEST_URL, true); // Skip video gen

    console.log('----------------------------------------');
    console.log('CAMPAIGN RESULT');
    console.log('----------------------------------------');

    if (result.status === 'success') {
        console.log('Status: SUCCESS');
        if (result.video) {
            console.log('Video URL:', result.video.videoUrl);
        } else {
            console.log('Video URL: (Skipped)');
        }
        console.log('\n--- Script ---');
        console.log(result.script);
    } else {
        console.log('Status: FAILED');
        console.log('Error:', result.error);
    }

    console.log('\n--- Logs ---');
    result.logs.forEach(l => console.log(`${l.timestamp.toISOString().split('T')[1]} - ${l.message}`));
}

runTest();
