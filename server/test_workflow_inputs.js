const { runCampaign } = require('./workflow');

const TEST_URL = 'https://www.amazon.com/BAYKA-Stainless-Filtration-Resistant-Borosilicate/dp/B087PTW7F5/?_encoding=UTF8&pd_rd_w=DWaMc&content-id=amzn1.sym.7b937733-7b0e-4587-b999-f575a417f6a5&pf_rd_p=7b937733-7b0e-4587-b999-f575a417f6a5&pf_rd_r=M3Y4ZD0NDFMT4AP61CBN&pd_rd_wg=l7aBy&pd_rd_r=9bd833ce-924f-4a03-aff5-0eada92b5b89&ref_=pd_hp_d_btf_cr_cartx';

async function runTest() {
    console.log(`Testing Workflow Inputs (skipping video gen) for: ${TEST_URL}`);
    try {
        const result = await runCampaign(TEST_URL, true); // true = skipVideoGen

        console.log('\n==================================================');
        console.log('WORKFLOW RESULT (Video Skipped)');
        console.log('==================================================');

        if (result.status === 'success') {
            console.log('Status: SUCCESS');
            console.log('\n[SELECTED IMAGE]');
            console.log(result.video.mainImage);

            console.log('\n[VIDEO PROMPT]');
            console.log(result.video.videoPrompt);

            console.log('\n[LOGS]');
            result.logs.forEach(log => console.log(`[${log.timestamp.toISOString()}] ${log.message}`));
        } else {
            console.log('Status: FAILED');
            console.error(result.error);
        }

    } catch (error) {
        console.error('Test Execution Failed:', error);
    }
}

runTest();
