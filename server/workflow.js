const { scrapeProductData } = require('./scraper');
const { generateResearchPrompt, generateScriptFromInsights, selectBestImage, categorizeProduct, distillProductData } = require('./gemini');
const { generateMarketingInsights } = require('./video_marketer');
const { generateVeo3Video } = require('./veo3');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function runCampaign(url, skipVideoGen = false, onLog = null) {
    const log = [];
    const addLog = (tag, message, data = null) => {
        const logEntry = { timestamp: new Date(), tag, message, data };
        console.log(`[Campaign] [${tag}] ${message} `);
        log.push(logEntry);
        if (onLog) onLog(logEntry);
    };

    try {
        // 1. Scrape Product Data
        addLog('INTEL', `Scraping URL: ${url} `);
        const scrapedData = await scrapeProductData(url);

        // 1.1 AI Distillation (Clean up noise, find real product)
        addLog('INTEL', `Distilling core product data from raw text...`);
        const distilled = await distillProductData(scrapedData.rawText);

        const productData = {
            ...scrapedData,
            category: distilled.category,
            description: distilled.description,
            productName: distilled.productName
        };

        addLog('INTEL', `Product identified: ${productData.productName}`);
        addLog('INTEL', `Category refined to: ${productData.category}`);

        addLog('INTEL', `Data extraction complete.`, {
            category: productData.category,
            description: productData.description
        });

        // 1.5 Save all scraped images for investigation
        addLog(`Step 1.5: Saving all scraped images...`);
        const imagesDir = path.join(__dirname, 'public', 'scraped_images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        const savedImages = [];
        const allScrapedImages = productData.images || (productData.image ? [productData.image] : []);

        for (let i = 0; i < allScrapedImages.length; i++) {
            try {
                const imgUrl = allScrapedImages[i];
                const ext = path.extname(imgUrl).split('?')[0] || '.jpg';
                const filename = `scraped_${Date.now()}_${i}${ext}`;
                const filePath = path.join(imagesDir, filename);

                const response = await axios({
                    url: imgUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                savedImages.push(`/scraped_images/${filename}`);
            } catch (e) {
                console.error(`Failed to save image ${i}:`, e.message);
            }
        }
        addLog(`Saved ${savedImages.length} images to local disk.`);
        productData.localImages = savedImages; // Attach to productData for reference

        // 2. Generate Research Prompt
        addLog('TREND', `Generating Research Prompt...`);
        const researchPrompt = await generateResearchPrompt(productData);
        addLog('TREND', `Viral research prompt synthesized for Memories.ai.`, {
            prompt: researchPrompt
        });

        // 3. Get Marketing Insights
        addLog('TREND', `Fetching Marketing Insights from Memories.ai...`);
        // Use a random session ID to avoid caching/collisions
        const sessionId = Math.floor(Math.random() * 1000000);
        const insights = await generateMarketingInsights(researchPrompt, sessionId, 'TIKTOK');

        // Extract the most relevant video name from thinkings if available
        let videoName = "Viral trend identified.";
        if (insights?.data?.thinkings) {
            for (const thinking of insights.data.thinkings) {
                if (thinking.refs?.[0]?.video?.video_name) {
                    videoName = thinking.refs[0].video.video_name;
                    break;
                }
            }
        }

        addLog('TREND', `Marketing insights received from Memories.ai.`, {
            insights: videoName,
            rawOutput: insights?.data?.content || "Analyzing viral patterns and engagement metrics..."
        });

        // 4. Generate Script
        addLog('SCRIPT', `Writing Video Script...`);
        const script = await generateScriptFromInsights(insights, productData);
        addLog('SCRIPT', `Viral script finalized.`, {
            script: script,
            hook: script.split('\n')[0]
        });

        // 5. Generate Video (Optional)
        let videoResult = null;
        // Prepare inputs for Veo3
        const videoPrompt = `Create a high-energy, viral 9:16 TikTok advertisement for this product: ${productData.category}. 
        Product Description: ${productData.description}. 
        Follow this script flow: ${script.replace(/\[.*?\]/g, '').substring(0, 500)}. 
        Visual Style: Cinematic, high-fidelity, vibrant lighting, professional product showcase.`;

        addLog('RENDER', `Selecting best product image...`);
        const allImages = productData.images || (productData.image ? [productData.image] : []);
        const mainImage = await selectBestImage(allImages, productData.description);
        addLog('INTEL', `Image validation complete.`, {
            reason: "Selected clear, professional product shot. Disqualified lifestyle/collage candidates."
        });
        addLog('RENDER', `Cinematic prompt generated for Google Veo 3.1.`, {
            veoPrompt: videoPrompt
        });

        if (!skipVideoGen) {
            addLog('RENDER', `Generating Video with Veo3...`);
            videoResult = await generateVeo3Video([mainImage], videoPrompt, '9:16');
            addLog('RENDER', `Video Generated successfully.`);
        } else {
            addLog('SYSTEM', `Video Generation Skipped (Inputs prepared above).`);
            // Return inputs for debugging
            videoResult = {
                skipped: true,
                videoPrompt,
                mainImage
            };
        }

        return {
            status: 'success',
            productData,
            researchPrompt,
            insights,
            tiktokUrls: insights.tiktokUrls || [],
            script,
            selectedImage: mainImage,
            videoPrompt,
            video: videoResult,
            logs: log
        };

    } catch (error) {
        addLog(`Error: ${error.message} `);
        return {
            status: 'failed',
            error: error.message,
            logs: log
        };
    }
}

module.exports = { runCampaign };
