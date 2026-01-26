const axios = require("axios");
const cheerio = require("cheerio"); // You may need to run: npm install cheerio

async function fetchSnapchat(videoUrl) {
    // --- STEP 1: PRIMARY (GetInDevice) ---
    try {
        console.log("Attempting GetInDevice...");
        
        // 1. Get the homepage to extract the required token
        const homePage = await axios.get("https://getindevice.com/snapchat-video-downloader/");
        const $ = cheerio.load(homePage.data);
        const token = $('#token').val(); // Grabs the hidden input token
        
        if (token) {
            // 2. Post the video URL with the token
            // Note: GetInDevice uses form-data or specific AJAX headers
            const response = await axios.post("https://getindevice.com/wp-json/aio-dl/video-data", 
            {
                url: videoUrl,
                token: token
            },
            {
                headers: {
                    "x-requested-with": "XMLHttpRequest",
                    "origin": "https://getindevice.com",
                    "referer": "https://getindevice.com/snapchat-video-downloader/",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
                }
            });

            if (response.data && response.data.url) {
                return { source: "getindevice", data: response.data };
            }
        }
    } catch (err) {
        console.error("GetInDevice failed, trying fallback...");
    }

    // --- STEP 2: FALLBACK (Solyptube) ---
    try {
        console.log("Attempting Solyptube...");
        const response = await axios.post(
            "https://solyptube.com/findsnapchatvideo",
            { url: videoUrl },
            {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "origin": "https://solyptube.com", // Fixed to match domain
                    "referer": "https://solyptube.com/snapchat-video-download", // Fixed to match domain
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
                }
            }
        );
        return { source: "solyptube", data: response.data };
    } catch (error) {
        console.error("All downloaders failed.");
        throw new Error(`Snapchat API request failed: ${error.message}`);
    }
}

module.exports = { fetchSnapchat };
