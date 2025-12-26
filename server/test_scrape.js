const { scrapeProductData } = require('./scraper');

const TEST_URL = 'https://memories.ai/luci/';

async function runTest() {
    console.log(`Testing scraper with: ${TEST_URL}`);
    try {
        const data = await scrapeProductData(TEST_URL);
        console.log('----------------------------------------');
        console.log('IMAGES FOUND:', data.images.length);
        console.log('FIRST IMAGE:', data.image);
        console.log('----------------------------------------');
        console.log('DESCRIPTION LENGTH:', data.description.length, 'characters');
        console.log('DESCRIPTION PREVIEW:\n', data.description.substring(0, 500) + '...');
        console.log('----------------------------------------');
        console.log('CATEGORY:', data.category);
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

runTest();
