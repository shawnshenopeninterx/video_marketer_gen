const { generateCleanProductImage } = require('./server/gemini');

async function testGeneration() {
    console.log('Testing Image Generation...');
    const prompt = 'Professional product photo of a sleek, black wearable AI camera pin, sitting on a clean white surface, high quality, 4k';
    const imageUrl = await generateCleanProductImage(prompt);
    console.log('Generated Image URL:', imageUrl);
}

testGeneration();
