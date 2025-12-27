const { fal } = require("@fal-ai/client");

// Fal.ai client automatically uses process.env.FAL_KEY or process.env.FAL_API_KEY
fal.config({
    credentials: process.env.FAL_KEY || process.env.FAL_API_KEY
});

async function generateTextFal(prompt) {
    try {
        console.log(`Calling Fal.ai Text Model (Llama 3.1 70B)...`);

        const result = await fal.run("fal-ai/llama/v3-1-70b-instruct", {
            input: {
                prompt: prompt
            }
        });

        if (result && result.output) {
            return result.output;
        }

        throw new Error(`Fal.ai text generation failed: ${JSON.stringify(result)}`);
    } catch (error) {
        console.error('Fal.ai Text Generation Error:', error);
        throw error;
    }
}

module.exports = { generateTextFal };
