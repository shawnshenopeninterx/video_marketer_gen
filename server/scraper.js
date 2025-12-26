const puppeteer = require('puppeteer');

async function scrapeProductData(url) {
    let browser = null;
    try {
        console.log(`Launching Puppeteer for URL: ${url}`);
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Scroll to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight || totalHeight > 3000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        const data = await page.evaluate(() => {
            const getMeta = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.content : null;
            };

            // 1. Images (Collect Multiple)
            const imageSet = new Set();

            // Add OG Image
            const ogImage = getMeta('meta[property="og:image"]') || getMeta('meta[name="twitter:image"]');
            if (ogImage) imageSet.add(ogImage);

            // Add Page Images
            const imgs = Array.from(document.querySelectorAll('img'));
            for (const img of imgs) {
                const src = img.src;
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;

                if (src &&
                    !src.endsWith('.svg') &&
                    !src.includes('data:image/svg+xml') &&
                    !src.includes('logo') &&
                    !src.includes('icon') &&
                    width > 300 && // Higher threshold for quality
                    height > 300) {
                    imageSet.add(src);
                }
            }
            const images = Array.from(imageSet); // Get all images

            // 2. Collect ALL substantial text for AI distillation
            const textParts = [];

            // Get Title
            const title = document.title;
            if (title) textParts.push(`PAGE_TITLE: ${title}`);

            // Get H1s (usually product name)
            const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
            if (h1s.length) textParts.push(`HEADINGS_H1: ${h1s.join(' | ')}`);

            // Get all paragraphs and list items
            const contentNodes = Array.from(document.querySelectorAll('p, li, h2, h3, div[class*="description"], div[id*="description"]'));
            for (const node of contentNodes) {
                const text = node.innerText.trim();
                // Filter out very short strings and common UI noise
                if (text.length > 20 &&
                    !text.includes('JavaScript') &&
                    !text.includes('cookies') &&
                    !text.includes('Copyright')) {
                    textParts.push(text);
                }
            }

            const rawText = textParts.join('\n\n');

            // 3. Category (Keep as fallback)
            let category = getMeta('meta[property="og:type"]') ||
                getMeta('meta[name="category"]') ||
                getMeta('meta[property="product:category"]');

            return { images, rawText, category };
        });

        return {
            image: data.images[0] || null,
            images: data.images,
            rawText: data.rawText,
            category: data.category
        };

    } catch (error) {
        console.error('Puppeteer scraping error:', error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeProductData };
