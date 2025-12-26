const { generateVeo3Video } = require('./veo3');

async function runTest() {
    const images = []; // Currently unused in this implementation
    const prompt = "A futuristic city with flying cars, neon lights, 4k, cinematic.";

    console.log('----------------------------------------');
    console.log('Testing Veo3 Video Generation (Google GenAI)');
    console.log('----------------------------------------');

    try {
        const result = await generateVeo3Video(images, prompt);

        console.log('----------------------------------------');
        console.log('GENERATION SUCCESS');
        console.log('----------------------------------------');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runTest();
