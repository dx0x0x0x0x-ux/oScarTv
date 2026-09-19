const express = require('express');
const { gotScraping } = require('got-scraping');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = "https://104.21.30.103";
const DEVICE_ID = crypto.randomUUID();

const HEADERS = {
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 14; BlueStacks Build/UD1A.230803.022)",
    "X-Requested-With": "com.drama.mp4",
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive"
};

app.get('/', async (req, res) => {
    try {
        console.log("1. جاري تنفيذ الطلب التمهيدي وتخطّي حماية TLS...");

        // 1. طلب تمهيدي لتخطي حماية Cloudflare والحصول على الجلسة
        const response = await gotScraping({
            url: `${BASE_URL}/api/v2/home.php?app_version=15`,
            headers: HEADERS,
            headerGeneratorOptions: {
                browsers: [{ name: 'chrome', minVersion: 120 }],
                operatingSystems: ['android'],
                deviceCategory: 'mobile'
            }
        });

        console.log("✔ تم اجتياز حظر Cloudflare! كود الاستجابة:", response.statusCode);

        // 2. طلب البيانات المباشر مع معلمات الجهاز
        const apiData = await gotScraping({
            url: `${BASE_URL}/api/series/?page=1&limit=20&device_id=${DEVICE_ID}`,
            headers: HEADERS,
            headerGeneratorOptions: {
                browsers: [{ name: 'chrome', minVersion: 120 }],
                operatingSystems: ['android'],
                deviceCategory: 'mobile'
            }
        });

        res.json({
            status: "success",
            data: JSON.parse(apiData.body)
        });

    } catch (error) {
        console.error("❌ خطأ بالاتصال:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
