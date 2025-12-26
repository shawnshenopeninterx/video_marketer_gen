const { GoogleGenAI } = require("@google/genai");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Using the working API key
const API_KEY = 'AIzaSyBKjCltZqH5m4YIIv2WAv9YUxYAkFsQF4Q';
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generateText(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Fast model for text
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // console.log('Gemini Response:', JSON.stringify(response, null, 2)); // Debug if needed

        // Based on logs: response.candidates[0].content.parts[0].text
        if (response.candidates && response.candidates[0].content.parts[0].text) {
            return response.candidates[0].content.parts[0].text;
        } else if (response.response && typeof response.response.text === 'function') {
            return response.response.text();
        } else {
            console.log('Unexpected Gemini Response Structure:', JSON.stringify(response, null, 2));
            return "Error: Could not generate text";
        }
    } catch (error) {
        console.error('Gemini Text Gen Error:', error);
        throw error;
    }
}

async function generateResearchPrompt(productData) {
    const prompt = `
    I have a product with the following details:
    Category: ${productData.category}
    Description: ${productData.description}

    Write a specific prompt that I can send to a "Video Marketing AI" to find viral videos.
    The prompt should be in the format: "Find me the most viral or popular video in the product category [Category] related to [Key Feature], and write a viral script for the product"
    Return ONLY the prompt string, nothing else.
  `;
    return await generateText(prompt);
}

async function distillProductData(rawText) {
    const prompt = `
    I have raw text scraped from a product page. 
    Your task is to extract the core product information and ignore all noise (reviews, shipping info, footer links, protection plans, etc.).
    
    Raw Scraped Text:
    ${rawText.substring(0, 5000)}
    
    Return a JSON object with:
    {
        "productName": "string",
        "description": "string (a concise, compelling 2-3 sentence description of the core product features)",
        "category": "string (a specific, professional category like 'Smart Home Security' or 'Premium Audio')"
    }
    
    IMPORTANT: If the text mentions protection plans or warranties, ignore them. Focus ONLY on the physical product being sold.
    Return ONLY the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        const text = response.candidates[0].content.parts[0].text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Distillation error:", e);
        return {
            productName: "Unknown Product",
            description: rawText.substring(0, 200),
            category: "General"
        };
    }
}

async function categorizeProduct(description) {
    // This is now handled by distillProductData, but keeping for backward compatibility
    const prompt = `
    Based on this product description, provide a single, specific category name (e.g., "Smart Home Security", "Luxury Skincare", "Portable Audio").
    Description: ${description.substring(0, 1000)}
    
    Return ONLY the category name, nothing else.
    `;
    return await generateText(prompt);
}

async function generateScriptFromInsights(insights, productData) {
    // Extract relevant text from insights (handling the specific API response structure)
    let insightsText = "";
    if (insights.data && insights.data.msg) {
        insightsText = JSON.stringify(insights.data.msg);
    } else {
        insightsText = JSON.stringify(insights);
    }

    const prompt = `
    I am creating a 15-second viral TikTok video for a product.
    
    Product Description: ${productData.description}
    
    Here are some insights from a marketing AI about viral trends in this space:
    ${insightsText}

    Using these insights, write a 15-second video script.
    Format:
    [Scene 1]: Visual description (Audio: "Spoken text")
    [Scene 2]: ...
    
    Keep it punchy, energetic, and optimized for TikTok.
  `;
    return await generateText(prompt);
}

async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    } catch (e) {
        // console.error(`Failed to download image ${url}:`, e.message);
        return null;
    }
}

async function validateImageClarity(imageUrl, productDescription) {
    console.log(`Validating image clarity for: ${imageUrl}`);
    const b64 = await downloadImage(imageUrl);
    if (!b64) return false;

    const prompt = `
    I am showing you an image selected from a product page.
    Product: ${productDescription}
    
    Is this a **CLEAR, SINGLE PRODUCT SHOT**?
    
    Answer NO if:
    - It is a lifestyle shot (people, hands, busy background).
    - It is a carousel, collage, or shows multiple small photos.
    - It is an exploded view or disassembled parts.
    - It is a logo, icon, or schematic.
    - It is blurry or low quality.
    
    Answer YES only if it is a professional, clean shot of the fully assembled product.
    
    Return ONLY "YES" or "NO".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { data: b64, mimeType: "image/jpeg" } },
                    { text: prompt }
                ]
            }]
        });
        const text = response.candidates[0].content.parts[0].text.trim().toUpperCase();
        return text.includes('YES');
    } catch (e) {
        console.error("Validation error:", e);
        return false;
    }
}

async function selectBestImage(imageUrls, productDescription) {
    console.log(`Selecting best image from ${imageUrls.length} candidates...`);
    const candidates = imageUrls.slice(0, 15);
    const imageParts = [];
    const validCandidateUrls = [];

    for (const url of candidates) {
        const b64 = await downloadImage(url);
        if (b64) {
            imageParts.push({
                inlineData: {
                    data: b64,
                    mimeType: "image/jpeg"
                }
            });
            validCandidateUrls.push(url);
        }
    }

    if (imageParts.length === 0) {
        console.log("No valid images found for selection. Generating new image...");
        return await generateCleanProductImage(`A clean, professional product photo of ${productDescription} on a studio-lit white background.`);
    }

    const prompt = `
    I have provided ${imageParts.length} images from a product page.
    Product Description: ${productDescription}
    
    Task: Select the SINGLE best image that is a **CLEAR, PROFESSIONAL PRODUCT PHOTO**.
    
    STRICT DISQUALIFICATION CRITERIA (Return -1 if any of these apply to all images):
    1. **NO LIFESTYLE SHOTS**: No people, no hands, no busy backgrounds.
    2. **NO CAROUSELS/COLLAGES**: No images showing multiple photos or a "reel" of images.
    3. **NO EXPLODED VIEWS**: No internal parts or disassembled components.
    4. **NO LOGOS/ICONS**: No Amazon/Prime logos, no UI buttons, no shipping icons.
    5. **NO SCHEMATICS**: No technical drawings or blueprints.
    
    IDEAL IMAGE:
    - The product is the center of attention.
    - Clean, solid, or transparent background.
    - The product is fully assembled and looks exactly like what the customer receives.
    
    If NONE of the images are a perfect, clean product shot, you MUST return bestImageIndex: -1.
    
    Return a JSON object with:
    {
        "bestImageIndex": number, // 0-based index of the best image. Return -1 if NONE are perfect.
        "reason": "string",
        "generationPrompt": "string" // A highly detailed prompt for Imagen 4 to generate a clean, professional, 3D-feeling product shot of this specific item on a studio-lit white background.
    }
    Return ONLY the JSON.
    `;

    try {
        const parts = [...imageParts, { text: prompt }];
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [{ role: 'user', parts: parts }]
        });

        const text = response.candidates[0].content.parts[0].text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonStr);

        console.log("Image selection result:", result);

        if (result.bestImageIndex !== -1 && result.bestImageIndex < validCandidateUrls.length) {
            const selectedUrl = validCandidateUrls[result.bestImageIndex];
            // Final validation step
            const isValid = await validateImageClarity(selectedUrl, productDescription);
            if (isValid) {
                return selectedUrl;
            } else {
                console.log("Selected image failed final clarity validation. Generating...");
                return await generateCleanProductImage(result.generationPrompt || `A clean product photo of ${productDescription}`);
            }
        } else {
            console.log("No suitable image found among candidates. Generating a clean product image...");
            const genPrompt = result.generationPrompt || `A clean, professional product photo of ${productDescription} on a solid background.`;
            return await generateCleanProductImage(genPrompt);
        }
    } catch (error) {
        console.error("Error in selectBestImage:", error);
        return validCandidateUrls[0] || null;
    }
}

async function generateCleanProductImage(prompt) {
    console.log("Generating image with prompt:", prompt);
    try {
        // Using Imagen 4 via Google GenAI SDK
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            number_of_images: 1
        });

        // Handle response
        if (response.generatedImages && response.generatedImages.length > 0) {
            const image = response.generatedImages[0].image;

            // Extract base64 data
            const b64 = image.imageBytes;
            if (b64) {
                const fileName = `generated_${Date.now()}.png`;
                const publicDir = path.join(__dirname, 'public');
                if (!fs.existsSync(publicDir)) {
                    fs.mkdirSync(publicDir, { recursive: true });
                }
                const filePath = path.join(publicDir, fileName);
                fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
                console.log(`Generated image saved to ${filePath}`);
                return `http://localhost:3000/${fileName}`;
            }
        }

        console.log("Image generation response structure unknown or no image returned:", JSON.stringify(response));
        return "https://placehold.co/600x400?text=Generated+Image+Placeholder";

    } catch (e) {
        console.error("Image generation failed:", e.message);
        return "https://placehold.co/600x400?text=Generation+Failed";
    }
}

module.exports = { generateResearchPrompt, generateScriptFromInsights, selectBestImage, generateCleanProductImage, categorizeProduct, distillProductData };
