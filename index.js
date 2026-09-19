const express = require('express');
const { createClient } = require('tls-client');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد عميل TLS محاكي لهواتف Android
const client = createClient({
    clientIdentifier: 'okpth_android_13', // محاكاة بصمة OkHttp الرسمية بـ Android
    ja3String: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-21,29-23-24,0',
    followRedirects: true,
    forceHttp1: true
});

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
        console.log("1. جاري تنفيذ الاتصال التمهيدي ببصمة TLS الخاصة بـ Android...");
        
        // 1. الطلب التمهيدي للحصول على الكوكيز
        const initResponse = await client.get(`${BASE_URL}/api/v2/home.php?app_version=15`, {
            headers: HEADERS
        });

        console.log("✔ تم اجتياز مصافحة Cloudflare! الكود:", initResponse.status);

        // 2. طلب البيانات المباشرة مع المعرف
        const apiResponse = await client.get(`${BASE_URL}/api/series/?page=1&limit=20&device_id=${DEVICE_ID}`, {
            headers: HEADERS
        });

        res.json({
            status: "success",
            data: apiResponse.body ? JSON.parse(apiResponse.body) : apiResponse.status
        });

    } catch (error) {
        console.error("❌ خطأ بالاتصال:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
